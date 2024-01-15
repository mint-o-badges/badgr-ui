import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {EmailValidator} from '../../../common/validators/email.validator';
import {MessageService} from '../../../common/services/message.service';
import {SessionService} from '../../../common/services/session.service';
import { DomSanitizer, Title } from '@angular/platform-browser';

import {CommonDialogsService} from '../../../common/services/common-dialogs.service';
import {BaseAuthenticatedRoutableComponent} from '../../../common/pages/base-authenticated-routable.component';
import {BadgrApiFailure} from '../../../common/services/api-failure';
import { ExternalAuthProvider, SocialAccountProviderInfo } from '../../../common/model/user-profile-api.model';
import {UserProfileManager} from '../../../common/services/user-profile-manager.service';
import {UserProfile, UserProfileEmail, UserProfileSocialAccount} from '../../../common/model/user-profile.model';
import {Subscription} from 'rxjs';
import {QueryParametersService} from '../../../common/services/query-parameters.service';
import {OAuthApiService} from '../../../common/services/oauth-api.service';
import {AppConfigService} from '../../../common/app-config.service';
import {typedFormGroup} from '../../../common/util/typed-forms';
// TODO: This doesn't compile anymore, since i18n is deprecated. See [this issue](https://github.com/orgs/mint-o-badges/projects/2/views/1?pane=issue&itemId=42737990)
//import { Message } from "@angular/compiler/src/i18n/i18n_ast";
import { animationFramePromise } from "../../../common/util/promise-util";

@Component({
	selector: 'userProfile',
	templateUrl: './profile.component.html'
})
export class ProfileComponent extends BaseAuthenticatedRoutableComponent implements OnInit, OnDestroy {
	emailForm = typedFormGroup()
		.addControl("email", "", [ Validators.required, EmailValidator.validEmail ])
	;

	profile: UserProfile;
	emails: UserProfileEmail[];

	profileLoaded: Promise<unknown>;
	emailsLoaded: Promise<unknown>;

	newlyAddedSocialAccountId: string;

	// isMoveInProgress = false;
	// menuOpen = false;

	private emailsSubscription: Subscription;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected profileManager: UserProfileManager,
		protected dialogService: CommonDialogsService,
		protected paramService: QueryParametersService,
		protected configService: AppConfigService,
		private oauthService: OAuthApiService,
		private sanitizer: DomSanitizer,
	) {
		super(router, route, sessionService);
		title.setTitle(`Profile - ${this.configService.theme['serviceName'] || "Badgr"}`);

		this.profileLoaded = this.profileManager.userProfilePromise.then(
			profile => {
				this.profile = profile;

				this.emailsSubscription = profile.emails.loaded$.subscribe(update => {
					const emails = profile.emails.entities;

					this.emails = emails.filter((e) => e.primary).concat(
						emails.filter((e) => e.verified && !e.primary).concat(
							emails.filter((e) => !e.verified)
						)
					);
				});
			},
			error => this.messageService.reportAndThrowError(
				"Failed to load userProfile", error
			)
		);

		this.emailsLoaded = this.profileManager.userProfilePromise
			.then(p => p.emails.loadedPromise);

		// Handle newly added social account
		this.newlyAddedSocialAccountId = paramService.queryStringValue("addedSocialAccountId", true);
	}

	sanitize(url:string){
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

	get socialAccounts() {
		return this.profile && this.profile.socialAccounts.entities;
	}

	ngOnInit() {
		super.ngOnInit();

		// Handle auth errors (e.g. when linking a new social account)
		if (this.paramService.queryStringValue("authError", true)) {
			this.messageService.reportHandledError(this.paramService.queryStringValue("authError", true), null, true);
		}
		this.paramService.clearInitialQueryParams();
	}

	ngOnDestroy(): void {
        if (this.emailsSubscription)
            this.emailsSubscription.unsubscribe();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Linked Accounts

	async unlinkAccount($event: Event, socialAccount: UserProfileSocialAccount, accountsNum: number) {
		$event.preventDefault();
		// safety first!
		if(accountsNum <= 1 && !this.profile.hasPasswordSet){
			await animationFramePromise();
			this.messageService.reportHandledError('Please set a password using the "Set Password" button above before removing this integration.');
			return false;
		}
		if (await this.dialogService.confirmDialog.openTrueFalseDialog({
			dialogTitle: `Unlink ${socialAccount.providerInfo.name}?`,
			dialogBody: `Are you sure you want to unlink the ${socialAccount.providerInfo.name} account ${socialAccount.fullLabel}) from your ${this.configService.theme['serviceName'] || "Badgr"} account? You may re-link in the future by clicking the ${socialAccount.providerInfo.name} button on this page.`,
			resolveButtonLabel: `Unlink ${socialAccount.providerInfo.name} account?`,
			rejectButtonLabel: "Cancel"
		})) {
			socialAccount.remove().then(
				() => this.messageService.reportMinorSuccess(`Removed ${socialAccount.fullLabel} from your account`),
				error => {
					if (error.response.status === 403) {
						this.messageService.reportHandledError(`Failed to remove ${socialAccount.fullLabel} from your account: ${error.response._body}`);
					} else {
						this.messageService.reportHandledError(`Failed to remove ${socialAccount.fullLabel} from your account: ${BadgrApiFailure.from(error).firstMessage}`);
					}
				}
			);
		}
	}

	linkAccount($event: Event, info: ExternalAuthProvider) {
		$event.preventDefault();
		this.oauthService.connectProvider(info).then(r => {
			window.location.href = r.url;
		});
	}


	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Emails

	submitEmailForm() {
		if (! this.emailForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.emailForm.value;

		this.profile.addEmail(formState.email).then(
			email => {
				this.messageService.setMessage("New email is currently pending.", "success");
				const emailControl = this.emailForm.rawControlMap.email;

				emailControl.setValue('', { emitEvent: false });
				emailControl.setErrors(null, { emitEvent: false });
			},
			error => {
				const badgeApiErr = BadgrApiFailure.from(error);
				const throttleMsg = BadgrApiFailure.messageIfThrottableError(JSON.parse(badgeApiErr.overallMessage));

				if(throttleMsg){
					this.messageService.reportHandledError(throttleMsg, error);
				}
				else if (error.response.status === 400) {
					this.messageService.reportHandledError(`Unable to add email: Email already exists`);
				} else {
					this.messageService.reportHandledError(`Unable to add email: ${BadgrApiFailure.from(error).firstMessage}`);
				}
			}
		);
	}

	// initialed displayed remove button.
	clickConfirmRemove(ev: MouseEvent, email: UserProfileEmail) {
		if (email.primary) {
			ev.preventDefault();
		} else {
			this.dialogService.confirmDialog.openResolveRejectDialog({
				dialogTitle: "Delete Email",
				dialogBody: `All badges associated with this email address will be removed. Are you sure you want to delete email ${email.email}`,
				resolveButtonLabel: "Confirm remove",
				rejectButtonLabel: "Cancel"
			}).then(
				() => this.clickRemove(ev, email), // success - clicked confirm
				cancel => void 0 // fail - clicked cancel
			);
		}
	}

	clickRemove(ev: MouseEvent, email: UserProfileEmail) {
		email.remove().then(
			() => this.messageService.reportMinorSuccess(`You have successfully removed ${email.email}`),
			error => this.messageService.reportHandledError(`Unable to remove ${email.email}: ${BadgrApiFailure.from(error).firstMessage}`, error)
		);
	}

	clickMakePrimary(ev: MouseEvent, email: UserProfileEmail) {
		email.makePrimary().then(
			() => {
				this.messageService.reportMajorSuccess(`${email.email} is now your primary email.`);
				this.profile.emails.updateList();
			},
			error => this.messageService.reportAndThrowError(`Unable to set ${email.email} to primary email: ${BadgrApiFailure.from(error).firstMessage}`, error)
		);
	}

	clickResendVerification(ev: MouseEvent, email: UserProfileEmail) {
		email.resendVerificationEmail().then(
			() => this.messageService.reportMajorSuccess(`Confirmation re-sent to ${email.email}`),
			error => {
				if (error.response.status === 429) {
					this.messageService.reportAndThrowError(`Failed to resend confirmation to ${email.email}: ${error.response._body}`, error);
				} else {
					this.messageService.reportAndThrowError(`Failed to resend confirmation to ${email.email}: ${BadgrApiFailure.from(error).firstMessage}`, error);
				}
			}
		);
	}
}
