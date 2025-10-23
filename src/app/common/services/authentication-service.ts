import { InjectionToken } from '@angular/core';
import { UserCredential } from '../model/user-credential.type';
import { Observable } from 'rxjs';

export const AUTH_PROVIDER = new InjectionToken<AuthenticationService>('AUTH_PROVIDER');

export interface AuthenticationService {
	validateToken(token?: string): Promise<void>;
	login(credential: UserCredential): Promise<void>;
	logout(nextObservable?: boolean): Promise<void>;
	handleAuthenticationError(): void;
	get isLoggedIn(): boolean;
	get isLoggedIn$(): Observable<boolean>;
	get baseUrl(): string;
}
