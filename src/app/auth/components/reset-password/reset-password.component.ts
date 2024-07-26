import { Component } from '@angular/core';

import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'change-password',
	templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent extends BaseRoutableComponent {
	changePasswordForm = typedFormGroup()
		.addControl('password1', '', [Validators.required, Validators.minLength(8)])
		.addControl('password2', '', [Validators.required, this.passwordsMatch.bind(this)]);

	get resetToken(): string {
		return this.route.snapshot.params['token'];
	}

	// Translations
	enterNewPassword;
	mustBe8Char;
	enterNewPasswordConfirmation;
	passwordsDoNotMatch;

	constructor(
		private fb: FormBuilder,
		private title: Title,
		private sessionService: SessionService,
		route: ActivatedRoute,
		router: Router,
		private configService: AppConfigService,
		private _messageService: MessageService,
		public translate: TranslateService,
	) {
		super(router, route);

		title.setTitle(`Reset Password - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		if (!this.resetToken) {
			this._messageService.reportHandledError('No reset token provided. Please try the reset link again.');
		}
	}

	ngOnInit() {
		super.ngOnInit();
	}

	submitChange() {
		if (!this.changePasswordForm.markTreeDirtyAndValidate()) {
			return;
		}

		const token = this.resetToken;
		const newPassword = this.changePasswordForm.controls.password1.value;

		if (token) {
			this.sessionService.submitForgotPasswordChange(newPassword, token).then(
				() => {
					// TODO: We should get the user's name and auth so we can send them to the auth page pre-populated
					this._messageService.reportMajorSuccess('Your password has been changed successfully.', true);
					return this.router.navigate(['/auth']);
				},
				(err) =>
					this._messageService.reportAndThrowError(
						'Your password must be uncommon and at least 8 characters. Please try again.',
						err,
					),
			);
		}
	}

	passwordsMatch(group: FormGroup) {
		let valid = true;
		let val: string;

		for (const name in group.controls) {
			if (val === undefined) {
				val = group.controls[name].value;
			} else {
				if (val !== group.controls[name].value) {
					valid = false;
					break;
				}
			}
		}

		if (valid) {
			return null;
		}

		return { passwordsMatch: 'Passwords do not match' };
	}
}
