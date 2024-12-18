import { inject, TestBed } from '@angular/core/testing';

import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { UserProfile, UserProfileEmail, UserProfileSocialAccount } from './user-profile.model';
import { ApiUserProfile, ApiUserProfileEmail, ApiUserProfileSocialAccount } from './user-profile-api.model';
import { verifyManagedEntitySet } from './managed-entity-set.spec';
import { UserProfileManager } from '../services/user-profile-manager.service';
import { MessageService } from '../services/message.service';
import { UserProfileApiService } from '../services/user-profile-api.service';
import { SessionService } from '../services/session.service';
import { AppConfigService } from '../app-config.service';
import { EventsService } from '../services/events.service';

xdescribe('UserProfile', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			declarations: [],
			imports: [],
			providers: [
				AppConfigService,
				MessageService,
				EventsService,
				SessionService,
				CommonEntityManager,
				UserProfileApiService,
				UserProfileManager,

				MessageService,
			],
		}),
	);

	it('should be constructable', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const UP = new UserProfile(commonManager);
	}));

	xit('should correctly alias fields', inject(
		[CommonEntityManager, SessionService],
		(commonManager: CommonEntityManager, sessionService: SessionService) => {
			const userProfile = new UserProfile(commonManager).applyApiModel(apiUserProfile);
			userProfile.emails.applyApiData(apiProfileEmails);
			userProfile.socialAccounts.applyApiData(apiSocialAccounts);
			verifyUserProfile(userProfile, apiUserProfile, apiProfileEmails, apiSocialAccounts);
		},
	));
});

export function verifyUserProfile(
	userProfile: UserProfile,
	apiProfile: ApiUserProfile,
	apiEmails: ApiUserProfileEmail[],
	apiSocialAccounts: ApiUserProfileSocialAccount[],
) {
	expect(userProfile.firstName).toEqual(apiProfile.first_name);
	expect(userProfile.lastName).toEqual(apiProfile.last_name);

	if (apiEmails) {
		verifyManagedEntitySet(userProfile.emails, apiEmails, verifyUserEmail);
	}

	if (apiSocialAccounts) {
		verifyManagedEntitySet(userProfile.socialAccounts, apiSocialAccounts, verifyUserSocialAccount);
	}
}

export function verifyUserSocialAccount(
	socialAccount: UserProfileSocialAccount,
	apiSocialAccount: ApiUserProfileSocialAccount,
) {
	expect(socialAccount.dateAdded).toEqual(new Date(apiSocialAccount.dateAdded));
	expect(socialAccount.uid).toEqual(apiSocialAccount.uid);
	expect(socialAccount.firstName).toEqual(apiSocialAccount.firstName);
	expect(socialAccount.lastName).toEqual(apiSocialAccount.lastName);
	expect(socialAccount.primaryEmail).toEqual(apiSocialAccount.primaryEmail);
	expect(socialAccount.providerSlug).toEqual(apiSocialAccount.provider);
	expect(socialAccount.providerInfo.slug).toEqual(apiSocialAccount.provider);
}

export function verifyUserEmail(email: UserProfileEmail, apiEmail: ApiUserProfileEmail) {
	expect(email.numericId).toEqual(apiEmail.id);
	expect(email.email).toEqual(apiEmail.email);
	expect(email.primary).toEqual(apiEmail.primary);
	expect(email.verified).toEqual(apiEmail.verified);
}

export const apiUserProfile = {
	first_name: 'Zelda',
	last_name: 'Hyrule',
} as ApiUserProfile;

export const apiProfileEmail0: ApiUserProfileEmail = {
	id: 0,
	email: '00@badgr.io',
	primary: false,
	verified: false,
};
export const apiProfileEmail1: ApiUserProfileEmail = {
	id: 1,
	email: '01@badgr.io',
	primary: false,
	verified: true,
};
export const apiProfileEmail2: ApiUserProfileEmail = {
	id: 2,
	email: '10@badgr.io',
	primary: true,
	verified: false,
};
export const apiProfileEmail3: ApiUserProfileEmail = {
	id: 3,
	email: '11@badgr.io',
	primary: true,
	verified: true,
};

export const apiProfileEmails = [apiProfileEmail0, apiProfileEmail1, apiProfileEmail2, apiProfileEmail3];

export const apiSocialAccountFacebook: ApiUserProfileSocialAccount = {
	id: 'social-account:facebook',
	url: '',
	provider: 'facebook',
	dateAdded: new Date().toISOString(),
	uid: 'facebook-uid',
	firstName: 'Face',
	lastName: 'Book',
	primaryEmail: 'facebook@badgr.io',
};
export const apiSocialAccountKony: ApiUserProfileSocialAccount = {
	id: 'social-account:kony',
	url: '',
	provider: 'kony',
	dateAdded: new Date().toISOString(),
	uid: 'kony-uid',
	firstName: 'Kony',
	lastName: 'Auth',
	primaryEmail: 'kony@badgr.io',
};
export const apiSocialAccountLinkedIn: ApiUserProfileSocialAccount = {
	id: 'social-account:linkedin_oauth2',
	url: '',
	provider: 'linkedin_oauth2',
	dateAdded: new Date().toISOString(),
	uid: 'linkedin-uid',
	firstName: 'Linked',
	lastName: 'In',
	primaryEmail: 'linkedin@badgr.io',
};
export const apiSocialAccountGoogle: ApiUserProfileSocialAccount = {
	id: 'social-account:google',
	url: '',
	provider: 'google',
	dateAdded: new Date().toISOString(),
	uid: 'google-uid',
	firstName: 'google',
	lastName: 'Plex',
	primaryEmail: 'google@badgr.io',
};
export const apiSocialAccounts = [
	apiSocialAccountFacebook,
	apiSocialAccountKony,
	apiSocialAccountLinkedIn,
	apiSocialAccountGoogle,
];
