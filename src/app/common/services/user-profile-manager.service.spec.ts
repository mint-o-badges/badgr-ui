import {inject, TestBed} from '@angular/core/testing';
import {AppConfigService} from '../app-config.service';
import {CommonEntityManager} from '../../entity-manager/services/common-entity-manager.service';
import {expectRequestAndRespondWith, setupMockResponseReporting} from '../util/mock-response-util.spec';
import {verifyEntitySetWhenLoaded} from '../../common/model/managed-entity-set.spec';

import {MessageService} from '../../common/services/message.service';
import {SessionService} from '../../common/services/session.service';
import {UserProfileManager} from './user-profile-manager.service';
import {UserProfileApiService} from './user-profile-api.service';
import {ApiUserProfile, ApiUserProfileEmail, ApiUserProfileSocialAccount} from '../model/user-profile-api.model';
import {apiProfileEmails, apiSocialAccounts, apiUserProfile, verifyUserProfile} from '../model/user-profile.model.spec';
import {UserProfile} from '../model/user-profile.model';
import {EventsService} from './events.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import { RouterTestingModule } from "@angular/router/testing";
import { CommonModule } from "@angular/common";
import { BadgrCommonModule, COMMON_IMPORTS } from "../badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../mocks/mocks.module.spec";

xdescribe('UserProfileManager', () => {
	beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [  ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                CommonModule,
                BRequestMethodadgrCommonModule,
                ...COMMON_IMPORTS,
            ],
            providers: [
                ...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
            ],
        });
    });

    let httpMock = TestBed.get(HttpTestingController);
	setupMockResponseReporting();

	beforeEach(inject([ SessionService ], (loginService: SessionService) => {
		loginService.storeToken({ access_token: "MOCKTOKEN" });
	}));

	it('should retrieve user profile',
		inject(
			[ UserProfileManager, SessionService, HttpClientTestingModule ],
			(userProfileManager: UserProfileManager, loginService: SessionService) => {
				return Promise.all([
					expectUserProfileRequest(httpMock),
					verifyEntitySetWhenLoaded(
						userProfileManager.userProfileSet,
						[apiUserProfile],
						(e: UserProfile, ae: ApiUserProfile) => verifyUserProfile(e, ae, null, null)
					)
				]);
			}
		)
	);

	it('should retrieve emails',
		inject(
			[ UserProfileManager, SessionService ],
			(userProfileManager: UserProfileManager, loginService: SessionService) => {
				return Promise.all([
					expectUserProfileRequest(httpMock),
					expectProfileEmailsRequest(httpMock),
					userProfileManager.userProfilePromise
						.then(p => p.emails.loadedPromise)
						.then(p => verifyEntitySetWhenLoaded(
							userProfileManager.userProfileSet,
							[apiUserProfile],
							(e: UserProfile, ae: ApiUserProfile) => verifyUserProfile(e, ae, apiProfileEmails, null)
						))
				]);
			}
		)
	);

	it('should retrieve social accounts',
		inject(
			[ UserProfileManager, SessionService ],
			(userProfileManager: UserProfileManager, loginService: SessionService) => {
				return Promise.all([
					expectUserProfileRequest(httpMock),
					expectProfileSocialAccountsRequest(httpMock),
					userProfileManager.userProfilePromise
						.then(p => p.socialAccounts.loadedPromise)
						.then(p => verifyEntitySetWhenLoaded(
							userProfileManager.userProfileSet,
							[apiUserProfile],
							(e: UserProfile, ae: ApiUserProfile) => verifyUserProfile(e, ae, null, apiSocialAccounts)
						))
				]);
			}
		)
	);
});

function expectUserProfileRequest(
	httpMock: HttpTestingController,
	apiProfile: ApiUserProfile = apiUserProfile
) {
	return expectRequestAndRespondWith(
		httpMock,
		RequestMethod.Get,
		`/v1/user/profile`,
		apiProfile
	);
}

function expectProfileEmailsRequest(
	httpMock: HttpTestingController,
	emails: ApiUserProfileEmail[] = apiProfileEmails
) {
	return expectRequestAndRespondWith(
		httpMock,
		RequestMethod.Get,
		`/v1/user/emails`,
		emails
	);
}

function expectProfileSocialAccountsRequest(
	httpMock: HttpTestingController,
	socialAccounts: ApiUserProfileSocialAccount[] = apiSocialAccounts
) {
	return expectRequestAndRespondWith(
		httpMock,
		RequestMethod.Get,
		`/v1/user/socialaccounts`,
		socialAccounts
	);
}
