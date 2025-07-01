import { Injectable } from '@angular/core';
// import { LoginService } from "../../auth/auth.service";
import { SessionService } from './session.service';
import { AppConfigService } from '../app-config.service';
import { MessageService } from './message.service';
import {
	HttpClient,
	HttpErrorResponse,
	HttpHeaders,
	HttpParams,
	HttpResponse,
	HttpResponseBase,
} from '@angular/common/http';
import { timeoutPromise } from '../util/promise-util';
import { Observable } from 'rxjs';
import { getCookie } from '../util/cookies';

export class BadgrApiError extends Error {
	constructor(
		public message: string,
		public response: HttpResponseBase,
	) {
		super(message);
	}
}

@Injectable({ providedIn: 'root' })
export abstract class BaseHttpApiService {
	baseUrl: string;

	static async addTestingDelay<T>(value: T, configService: AppConfigService): Promise<T> {
		const delayRange = configService.apiConfig.debugDelayRange;

		if (delayRange) {
			const delayMs = Math.floor(delayRange.minMs + (delayRange.maxMs - delayRange.minMs) * Math.random());

			console.warn(`Delaying API response by ${delayMs}ms for debugging`, value);

			await timeoutPromise(delayMs);

			return value;
		} else {
			return value;
		}
	}

	constructor(
		// protected sessionService: LoginService,
		protected sessionService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		this.baseUrl = this.configService.apiConfig.baseUrl;
	}

	get<T = object>(
		path: string,
		queryParams: HttpParams | { [param: string]: string | string[] } | null = null,
		requireAuth = true,
		useAuth = true,
		headers: HttpHeaders = new HttpHeaders(),
	): Promise<HttpResponse<T>> {
		const endpointUrl = path.startsWith('http') ? path : this.baseUrl + path;

		headers = this.addJsonResponseHeader(headers);
		this.messageService.incrementPendingRequestCount();

		return this.augmentRequest<T>(
			this.http.get<T>(endpointUrl, {
				observe: 'response',
				headers,
				params: queryParams,
				responseType: 'json',
				withCredentials: useAuth && (requireAuth || this.sessionService.isLoggedIn),
			}),
		);
	}

	post<T = object>(
		path: string,
		payload: unknown,
		queryParams: HttpParams | { [param: string]: string | string[] } | null = null,
		headers: HttpHeaders = new HttpHeaders(),
		requireAuth = true,
		useAuth = true,
	): Promise<HttpResponse<T>> {
		const endpointUrl = path.startsWith('http') ? path : this.baseUrl + path;

		headers = this.addJsonRequestHeader(headers);
		headers = this.addJsonResponseHeader(headers);
		headers = this.addCsrfTokenHeader(headers);
		this.messageService.incrementPendingRequestCount();

		return this.augmentRequest<T>(
			this.http.post<T>(endpointUrl, JSON.stringify(payload), {
				observe: 'response',
				headers,
				params: queryParams,
				responseType: 'json',
				withCredentials: useAuth && (requireAuth || this.sessionService.isLoggedIn),
			}),
		);
	}

	put<T = object>(
		path: string,
		payload: unknown,
		queryParams: HttpParams | { [param: string]: string | string[] } | null = null,
		headers: HttpHeaders = new HttpHeaders(),
	): Promise<HttpResponse<T>> {
		const endpointUrl = path.startsWith('http') ? path : this.baseUrl + path;

		headers = this.addJsonRequestHeader(headers);
		headers = this.addJsonResponseHeader(headers);
		headers = this.addCsrfTokenHeader(headers);
		this.messageService.incrementPendingRequestCount();

		return this.augmentRequest<T>(
			this.http.put<T>(endpointUrl, JSON.stringify(payload), {
				observe: 'response',
				headers,
				params: queryParams,
				responseType: 'json',
				withCredentials: true,
			}),
		);
	}

	delete<T = object>(
		path: string,
		payload: unknown = null,
		queryParams: HttpParams | { [param: string]: string | string[] } | null = null,
		headers: HttpHeaders = new HttpHeaders(),
	): Promise<HttpResponse<T>> {
		const endpointUrl = path.startsWith('http') ? path : this.baseUrl + path;
		headers = this.addJsonRequestHeader(headers);
		headers = this.addJsonResponseHeader(headers);
		headers = this.addCsrfTokenHeader(headers);
		this.messageService.incrementPendingRequestCount();

		return this.augmentRequest<T>(
			this.http.delete<T>(endpointUrl, {
				observe: 'response',
				headers,
				params: queryParams,
				responseType: 'json',
				withCredentials: true,
				...(payload ? { body: JSON.stringify(payload) } : {}),
			}),
		);
	}

	isJson = (str) => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	private augmentRequest<T>(o: Observable<HttpResponse<T>>): Promise<HttpResponse<T>> {
		const detectAndHandleResponseErrors = <T extends HttpResponseBase>(response: T): T | never => {
			if ((response && response.status < 200) || response.status >= 300) {
				if (response.status === 401 || response.status === 403) {
					this.sessionService.handleAuthenticationError();
				} else if (response.status === 0) {
					this.messageService.reportFatalError(`Server Unavailable`);
					// TODO: Is this going to cause trouble?
				} else if (
					response instanceof HttpErrorResponse &&
					response.error &&
					typeof response.error === 'string' &&
					!this.isJson(response.error)
				) {
					throw new BadgrApiError(response.error, response);
					// sometimes objects!
				} else if (
					response instanceof HttpErrorResponse &&
					response.error &&
					typeof response.error === 'object'
				) {
					throw new BadgrApiError(JSON.stringify(response.error), response);
					// and sometimes we give up and just dump the status!
				} else {
					throw new BadgrApiError(`Expected 2xx response; got ${response.status}`, response);
				}
			}

			return response;
		};

		return o
			.toPromise()
			.then((r) => this.addTestingDelay(r))
			.finally(() => this.messageService.decrementPendingRequestCount())
			.then<HttpResponse<T>>(
				(r) => detectAndHandleResponseErrors(r),
				(r) => {
					throw detectAndHandleResponseErrors(r);
				},
			);
	}

	private addJsonRequestHeader(headers: HttpHeaders) {
		return headers.append('Content-Type', 'application/json');
	}

	private addJsonResponseHeader(headers: HttpHeaders) {
		return headers.append('Accept', 'application/json');
	}

	private addCsrfTokenHeader(headers: HttpHeaders): HttpHeaders {
		// add csrf token if available
		const csrf = getCookie('csrftoken');
		if (csrf) {
			headers = headers.append('X-CSRFToken', csrf);
		}
		return headers;
	}

	private async addTestingDelay<T>(value: T): Promise<T> {
		return BaseHttpApiService.addTestingDelay(value, this.configService);
	}
}
