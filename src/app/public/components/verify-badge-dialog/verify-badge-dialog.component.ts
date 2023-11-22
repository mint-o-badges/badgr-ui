import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { Component, ElementRef, EventEmitter, Output, Renderer2 } from '@angular/core';
import {
	PublicApiBadgeAssertion,
	PublicApiBadgeAssertionWithBadgeClass
} from '../../models/public-api.model';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { preloadImageURL } from '../../../common/util/file-util';
import { PublicApiService } from '../../services/public-api.service';
import { MessageService } from '../../../common/services/message.service';
import {ApiV2Wrapper} from "../../../common/model/api-v2-wrapper";
// import { RecipientBadgeManager } from '../../../recipient/services/recipient-badge-manager.service';

const sha256 = require('tiny-sha256') as (email: string) => string;

export enum AwardedState {
	'MATCH' = 'match',
	'NO_MATCH' = 'noMatch',
	'NOT_VERIFIED' = 'notVerified'
}

export enum ExpiryState {
	'EXPIRED' = 'expired',
	'NOT_EXPIRED' = 'notExpired',
	'NEVER_EXPIRES' ='neverExpires'
}

@Component({
	selector: 'verify-badge-dialog',
	templateUrl: './verify-badge-dialog.component.html'
})
export class VerifyBadgeDialog extends BaseDialog {

	constructor(
		componentElem: ElementRef,
		public messageService: MessageService,
		renderer: Renderer2,
		public publicApiService: PublicApiService,
		public queryParamService: QueryParametersService,
	){
		super(componentElem, renderer);
	}

	@Output() verifiedBadgeAssertion: EventEmitter<PublicApiBadgeAssertion> = new EventEmitter<PublicApiBadgeAssertion>();

	get identityEmail(): string {
		return this.queryParamService.queryStringValue('identity__email');
	}

	get isBadgeVerified() {
		return this.awardedState !== AwardedState.NO_MATCH && this.expiryState !== ExpiryState.EXPIRED;
	}

	get verifyUrl() {
		return this.identityEmail
		       ? `https://badgecheck.io/?url=${this.badgeAssertion.id}&identity__email=${this.identityEmail}`
		       : `https://badgecheck.io/?url=${this.badgeAssertion.id}`;
	}

	private get isRevoked() {
		return this.badgeAssertion && this.badgeAssertion.revoked;
	}

	badgeAssertion: PublicApiBadgeAssertion = null;

	readonly issuerImagePlaceholderUrl = preloadImageURL('../../../../breakdown/static/images/placeholderavatar-issuer.svg');

	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';

	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	//exposes enums to the template
	readonly AWARDED_STATES = AwardedState;

	readonly EXPIRY_STATES = ExpiryState;

	awardedState: AwardedState;

	expiryState: ExpiryState;

	async openDialog( badgeAssertion: PublicApiBadgeAssertionWithBadgeClass ) {
		this.showModal();

		// Not one of 'our' badges, needs to be verified
		if (badgeAssertion.sourceUrl){
			try {
				const entityId = badgeAssertion['hostedUrl'].split('/').pop();
				const instance: ApiV2Wrapper<PublicApiBadgeAssertion> =
					await this.publicApiService.verifyBadgeAssertion(entityId);

				if (instance){
					this.badgeAssertion = instance.result instanceof Array ? instance.result[0] : instance.result;
				}
				else {
					this.messageService.reportAndThrowError("Failed to verify your badge");
				}

			}
			catch(e) {
				this.closeDialog();
				this.messageService.reportAndThrowError("Failed to verify your badge", e);
			}
		}

		// is one of ours and as such is already verified.
		else {
			this.badgeAssertion = badgeAssertion;
		}

		this.verifyBadgeAssertion();
	}

	private verifyBadgeAssertion(){

		if (this.isRevoked){
			this.messageService.reportFatalError("Assertion has been revoked:", this.badgeAssertion.revocationReason);
			return;
		}
		this.verifyEmail();
		this.verifyExpiresOn();
		this.broadcastVerifiedBadgeAssertion();
	}


	private verifyEmail() {
		if (!this.identityEmail) {
			this.awardedState = AwardedState.NOT_VERIFIED;
		}
		else if (this.badgeAssertion.recipient.hashed) {
			// hashed is true
			const hashedEmail = 'sha256$'+sha256( `${this.identityEmail}${this.badgeAssertion.recipient.salt}`);
			this.awardedState = hashedEmail === this.badgeAssertion.recipient.identity
			                    ? AwardedState.MATCH
			                    : AwardedState.NO_MATCH;
		}
		else {
			// hashed is false, identity is in plain text
			this.awardedState = AwardedState.MATCH;
		}
	}

	private verifyExpiresOn() {
		if (!this.badgeAssertion.expires) {
			this.expiryState = ExpiryState.NEVER_EXPIRES;
		}
		else {
			this.expiryState = new Date() > new Date(this.badgeAssertion.expires)
			                   ? ExpiryState.EXPIRED
			                   : ExpiryState.NOT_EXPIRED;
		}
	}

	private broadcastVerifiedBadgeAssertion() {
		if (this.badgeAssertion){
			this.verifiedBadgeAssertion.emit(this.badgeAssertion);
		}
	}

	private closeDialog() {
		this.closeModal();
	}
}
