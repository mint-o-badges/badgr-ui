import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from './authentication-service';
import { UserCredential } from '../model/user-credential.type';
import { AuthorizationTokenInformation } from './session.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
	private readonly httpClient = inject(HttpClient);
	private readonly configService = inject(AppConfigService);
	private readonly baseUrl: string;
	private isLoggedInSubject = new BehaviorSubject<boolean>(false);

	constructor() {
		this.baseUrl = this.configService.apiConfig.baseUrl;
	}
	handleAuthenticationError(): void {
		console.error('Authentication Error occured!');
	}

	async validateToken(token?: string): Promise<void> {
		const endpoint = this.baseUrl + '/v1/user/profile';
		const headers = new HttpHeaders().append('Authorization', `Bearer ${token}`);
		return lastValueFrom(
			this.httpClient.get<UserProfile>(endpoint, {
				observe: 'response',
				responseType: 'json',
				headers,
				withCredentials: true,
			}),
		).then((r) => {
			if (r.status < 200 || r.status >= 300) {
				this.isLoggedInSubject.next(false);
				throw new Error('Login Failed: ' + r.status);
			}
			this.isLoggedInSubject.next(true);
		});
	}
	login(credential: UserCredential, sessionOnlyStorage?: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
	logout(nextObservable?: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
	get isLoggedIn(): boolean {
		return this.isLoggedInSubject.value;
	}
	get isLoggedIn$(): Observable<boolean> {
		return this.isLoggedInSubject;
	}
}
