import { Component, ElementRef, Renderer2 } from '@angular/core';
import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { EmailValidator } from '../../../common/validators/email.validator';
import { IssuerStaffRoleSlug } from '../../models/issuer-api.model';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { Issuer, issuerStaffRoles } from '../../models/issuer.model';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { MemoizedProperty } from '../../../common/util/memoized-property-decorator';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'issuer-staff-create-dialog',
	templateUrl: './issuer-staff-create-dialog.component.html',
	styleUrls: ['./issuer-staff-create-dialog.component.css'],
})
export class IssuerStaffCreateDialogComponent extends BaseDialog {
	staffCreateForm = typedFormGroup()
		.addControl('staffRole', 'staff' as IssuerStaffRoleSlug, Validators.required)
		.addControl('staffEmail', '', [Validators.required, EmailValidator.validEmail]);

	issuer: Issuer;
	issuerSlug: string;
	issuerLoaded: Promise<Issuer>;
	error: string = null;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		protected formBuilder: FormBuilder,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		protected configService: AppConfigService,
		protected dialogService: CommonDialogsService,
		private translate: TranslateService
	) {
		super(componentElem, renderer);
	}

	openDialog() {
		this.showModal();
	}

	closeDialog() {
		this.closeModal();
		this.staffCreateForm.reset();
	}

	@MemoizedProperty()
	get issuerStaffRoleOptions() {
		return issuerStaffRoles.map((r) => ({
			label: r.label,
			value: r.slug,
			description: r.description,
		}));
	}

	submitStaffCreate() {
		if (!this.staffCreateForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formData = this.staffCreateForm.value;

		return this.issuer.addStaffMember(formData.staffRole, formData.staffEmail).then(
			() => {
				this.error = null;
				this.messageService.reportMinorSuccess(`Added ${formData.staffEmail} as ${formData.staffRole}`);
				this.closeModal();
			},
			(error) => {
				const err = BadgrApiFailure.from(error);
				console.log(err);
				this.error =
					BadgrApiFailure.messageIfThrottableError(err.overallMessage) || ''.concat(this.translate.instant('Issuer.addMember_failed'),": ",(err.firstMessage))
			},
		);
	}
}
