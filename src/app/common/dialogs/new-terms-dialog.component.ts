import { Component, ElementRef, Renderer2 } from '@angular/core';
import { BaseDialog } from './base-dialog';
import { AppConfigService } from '../app-config.service';
import { UserProfileManager } from '../services/user-profile-manager.service';
import { UserProfile } from '../model/user-profile.model';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'new-terms-dialog',
    template: ` <dialog
		aria-labelledby="updatedTermsDialog"
		aria-describedby="dialog1Desc"
		class="dialog dialog-is-active l-dialog"
		role="dialog"
	>
		<div class="dialog-x-box o-container">
			<div class="l-flex l-flex-justifybetween u-padding-top2x u-padding-xaxis3x">
				<h2 id="updatedTermsDialog" class="u-text-body-bold-caps text-dark1">Updated Terms of Service</h2>
			</div>
			<div class="u-padding-all3x">
				<p class="u-text u-text-body u-margin-bottom2x">
					We’ve updated our <a target="_blank" [href]="termsOfServiceLink">Terms of Service</a>.
				</p>

				<div class="u-background-light3 u-padding-all2x u-margin-bottom3x">
					<p class="u-text u-text-body" *ngIf="profile && profile.latestTermsDescription">
						{{ profile.latestTermsDescription }}
					</p>
				</div>

				<label class="checkbox checkbox-small u-margin-bottom3x" [class.checkbox-is-error]="isErrorState">
					<input name="terms" id="terms" type="checkbox" [(ngModel)]="agreedToTerms" />
					<span class="checkbox-x-text"
						>I have read and agree to the
						<a target="_blank" [href]="termsOfServiceLink">Terms of Service</a>.
						<div *ngIf="isErrorState" class="checkbox-x-errortext">
							Please read and agree to the Terms of Service if you want to continue.
						</div>
					</span>
				</label>

				<div class="l-flex l-flex-2x">
					<button class="button" (click)="submitAgreement()">Continue</button>
					<a class="button button-secondary" *ngIf="termsHelpLink" [href]="termsHelpLink" target="_blank"
						>Need Help?</a
					>
				</div>
			</div>
		</div>
	</dialog>`,
    imports: [NgIf, FormsModule],
})
export class NewTermsDialog extends BaseDialog {
	agreedToTerms = false;

	resolveFunc: () => void;
	rejectFunc: () => void;
	_agreedPromise: Promise<void> = null;

	hasSubmitted = false;

	profile: UserProfile;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private configService: AppConfigService,
		private profileManager: UserProfileManager,
	) {
		super(componentElem, renderer);
	}

	get agreedPromise(): Promise<void> {
		if (!this._agreedPromise) {
			this._agreedPromise = new Promise((resolve, reject) => {
				this.resolveFunc = resolve;
				this.rejectFunc = reject;
			});
		}
		return this._agreedPromise;
	}

	get termsOfServiceLink() {
		return this.configService.theme['termsOfServiceLink'] || 'https://badgr.org/missing-terms';
	}

	get termsHelpLink() {
		return this.configService.theme['termsHelpLink'] || 'https://badgr.org/missing-terms-help';
	}

	get isErrorState(): boolean {
		return this.hasSubmitted && !this.agreedToTerms;
	}

	submitAgreement() {
		this.hasSubmitted = true;
		if (this.agreedToTerms) {
			const profile = this.profile ? this.profile : this.profileManager.userProfile;
			profile.agreeToLatestTerms().then((_) => {
				this.closeDialog();
				if (this.resolveFunc) {
					this.resolveFunc();
				}
			});
		}
	}

	openDialog() {
		this.profileManager.userProfilePromise.then((profile) => {
			this.profile = profile;
		});
		if (!this.isOpen) this.showModal();
	}

	closeDialog() {
		this.closeModal();
	}
}
