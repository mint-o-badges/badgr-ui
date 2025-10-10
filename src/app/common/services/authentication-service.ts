import { UserCredential } from '../model/user-credential.type';
import { AuthorizationTokenInformation } from './session.service';

export interface AuthenticationService {
	validateToken(sessionOnlyStorage?: boolean): Promise<AuthorizationTokenInformation>;
	login(credential: UserCredential, sessionOnlyStorage?: boolean): Promise<AuthorizationTokenInformation>;
	logout(nextObservable?: boolean): Promise<void>;
	get isLoggedIn(): boolean;
}
