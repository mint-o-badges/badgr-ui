import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication-service';
import { UserCredential } from '../model/user-credential.type';
import { AuthorizationTokenInformation } from './session.service';

@Injectable({ providedIn: 'root' })
export class TokenAuthService implements AuthenticationService {
	validateToken(sessionOnlyStorage?: boolean): Promise<AuthorizationTokenInformation> {
		throw new Error('Method not implemented.');
	}
	login(credential: UserCredential, sessionOnlyStorage?: boolean): Promise<AuthorizationTokenInformation> {
		throw new Error('Method not implemented.');
	}
	logout(nextObservable?: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
	get isLoggedIn(): boolean {
		throw new Error('Method not implemented.');
	}
}
