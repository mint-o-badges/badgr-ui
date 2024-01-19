import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { BaseHttpApiService } from './base-http-api.service';
import { SessionService } from './session.service';
import { MessageService } from './message.service';
import { EventsService } from './events.service';
import { ApiUserProfile, ApiUserProfileEmail, ApiUserProfileSocialAccount } from '../model/user-profile-api.model';
import { HttpClient } from '@angular/common/http';
import { TOKEN_STORAGE_KEY } from './session.service';

@Injectable()
export class UserProfileApiService extends BaseHttpApiService {
	constructor(
		protected sessionService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
		protected eventsService: EventsService,
	) {
		super(sessionService, http, configService, messageService);
	}

	getProfile() {
		if (
			sessionStorage.getItem(TOKEN_STORAGE_KEY) ||
			localStorage.getItem(TOKEN_STORAGE_KEY) ||
			this.sessionService.isLoggedIn
		) {
			return this.get<ApiUserProfile>('/v1/user/profile').then((r) => r.body);
		} else {
			return Promise.reject('No user logged in');
		}
	}

	updatePassword(newPassword: string, currentPassword: string) {
		return this.put<ApiUserProfile>('/v1/user/profile', {
			password: newPassword,
			current_password: currentPassword,
		}).then((r) => r.body);
	}

	updateProfile(profile: ApiUserProfile) {
		return this.put<ApiUserProfile>('/v1/user/profile', profile).then((r) => r.body);
	}

	fetchEmails() {
		return this.get<ApiUserProfileEmail[]>('/v1/user/emails').then((r) => r.body);
	}

	fetchSocialAccounts() {
		return this.get<ApiUserProfileSocialAccount[]>('/v1/user/socialaccounts').then((r) => r.body);
	}

	addEmail(email: string) {
		return this.post<ApiUserProfileEmail>('/v1/user/emails', { email: email }).then((r) => r.body);
	}

	removeEmail(emailId: number) {
		return this.delete('/v1/user/emails/' + emailId);
	}

	removeSocialAccount(accountId: string) {
		return this.delete('/v1/user/socialaccounts/' + accountId);
	}

	setPrimaryEmail(emailId: number) {
		return this.put<ApiUserProfileEmail>('/v1/user/emails/' + emailId, { primary: true }).then((r) => r.body);
	}

	resendVerificationEmail(emailIdToVerify: number) {
		return this.put('/v1/user/emails/' + emailIdToVerify, { resend: true });
	}
}
