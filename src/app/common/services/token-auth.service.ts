import { inject, Injectable } from '@angular/core';
import { AUTH_PROVIDER, AuthenticationService } from './authentication-service';
import { UserCredential } from '../model/user-credential.type';
import { AuthorizationTokenInformation } from './session.service';
import {
	HttpClient,
	HttpEvent,
	HttpHandler,
	HttpHandlerFn,
	HttpHeaders,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';
import { UserProfile } from '../model/user-profile.model';

/**
 * An alternative implementation to {@link SessionService} that
 * only verifies a given token to temporarily be logged in for
 * a certain operation such as creating a badge via a webcomponent
 */
@Injectable({ providedIn: 'root' })
export class TokenAuthService implements AuthenticationService {
	private readonly _httpClient = inject(HttpClient);
	private readonly _configService = inject(AppConfigService);
	private readonly _baseUrl: string;
	private _token: string;
	private _isLoggedInSubject = new BehaviorSubject<boolean>(false);

	constructor() {
		this._baseUrl = this._configService.apiConfig.baseUrl;
	}
	handleAuthenticationError(): void {
		console.error('Authentication Error occured!');
	}

	async validateToken(token?: string): Promise<void> {
		this._token = token ?? '';
		const endpoint = this._baseUrl + '/v1/user/profile';
		const headers = new HttpHeaders().append('Authorization', `Bearer ${token}`);
		return lastValueFrom(
			this._httpClient.get<UserProfile>(endpoint, {
				observe: 'response',
				responseType: 'json',
				headers,
				withCredentials: true,
			}),
		).then((r) => {
			if (r.status < 200 || r.status >= 300) {
				this._isLoggedInSubject.next(false);
				throw new Error('Login Failed: ' + r.status);
			}
			this._isLoggedInSubject.next(true);
		});
	}
	login(credential: UserCredential, sessionOnlyStorage?: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
	logout(nextObservable?: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
	get isLoggedIn(): boolean {
		return this._isLoggedInSubject.value;
	}
	get isLoggedIn$(): Observable<boolean> {
		return this._isLoggedInSubject;
	}
	get baseUrl(): string {
		return this._baseUrl;
	}
	get token(): string {
		return this._token;
	}
}

export function authTokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
	const authService = inject(AUTH_PROVIDER);
	if (
		!req.url.startsWith(authService.baseUrl) ||
		req.headers.has('Authorization') ||
		!authService.isLoggedIn ||
		!(authService instanceof TokenAuthService)
	)
		return next(req);

	const authReq = req.clone({
		setHeaders: {
			Authorization: `Bearer ${(authService as TokenAuthService).token}`,
		},
	});

	return next(authReq);
}
