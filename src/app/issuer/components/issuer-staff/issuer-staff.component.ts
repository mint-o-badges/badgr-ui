import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';

import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { Title } from '@angular/platform-browser';
import { Issuer, IssuerStaffMember, issuerStaffRoles } from '../../models/issuer.model';
import { preloadImageURL } from '../../../common/util/file-util';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfileEmail } from '../../../common/model/user-profile.model';
import { IssuerStaffRoleSlug } from '../../models/issuer-api.model';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { IssuerStaffCreateDialogComponent } from '../issuer-staff-create-dialog/issuer-staff-create-dialog.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src';
import { DialogComponent } from '../../../components/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { Validators } from '@angular/forms';
import { EmailValidator } from '../../../common/validators/email.validator';
import { IssuerStaffRequestApiService } from '../../services/issuer-staff-request-api.service';
import { ApiStaffRequest } from '../../staffrequest-api.model';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';

@Component({
	templateUrl: './issuer-staff.component.html',
	standalone: false,
	styles: [
		`
			::ng-deep .radio .radio-x-text {
				--typography-size: 18px;
				line-height: 130%;
				font-weight: bold;
				padding-left: var(--gridspacing);
				color: var(--color-black);
			}

			::ng-deep .forminput p {
				color: var(--color-black);
				--typography-size: 18px;
				line-height: 130%;
			}
		`,
	],
})
export class IssuerStaffComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	get issuerStaffRoleOptions() {
		return (
			this._issuerStaffRoleOptions ||
			(this._issuerStaffRoleOptions = issuerStaffRoles.map((r) => ({
				label: r.label,
				value: r.slug,
				description: r.description,
			})))
		);
	}

	get isCurrentUserIssuerOwner() {
		return this.issuer && this.issuer.currentUserStaffMember && this.issuer.currentUserStaffMember.isOwner;
	}

	readonly issuerImagePlaceHolderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	issuer: Issuer;
	issuerSlug: string;
	issuerLoaded: Promise<Issuer>;
	profileEmailsLoaded: Promise<UserProfileEmail[]>;
	profileEmails: UserProfileEmail[] = [];
	error: string = null;

	staffRequests: ApiStaffRequest[] = [];

	selectedStaffRequestEmail: string | null = null;

	staffRequestsCaption: string | null = null;

	dialogRef: BrnDialogRef<any> = null;

	@ViewChild('issuerStaffCreateDialog')
	issuerStaffCreateDialog: IssuerStaffCreateDialogComponent;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	@ViewChild('headerConfirmStaffTemplate')
	headerConfirmStaffTemplate: TemplateRef<void>;

	@ViewChild('addMemberFormTemplate')
	addMemberFormTemplate: TemplateRef<void>;

	@ViewChild('staffRequestRoleTemplate')
	staffRequestRoleTemplate: TemplateRef<void>;

	breadcrumbLinkEntries: LinkEntry[] = [];

	private _issuerStaffRoleOptions: FormFieldSelectOption[];

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		protected configService: AppConfigService,
		protected dialogService: CommonDialogsService,
		protected translate: TranslateService,
		protected issuerStaffRequestApiService: IssuerStaffRequestApiService,
	) {
		super(router, route, loginService);
		title.setTitle(`Manage Issuer Staff - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.issuerSlug = this.route.snapshot.params['issuerSlug'];
		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
			this.breadcrumbLinkEntries = [
				{ title: 'Issuers', routerLink: ['/issuer'] },
				{ title: issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
				{ title: this.isCurrentUserIssuerOwner ? 'Mitglieder bearbeiten' : 'Mitglieder' },
			];
			return issuer;
		});

		this.profileEmailsLoaded = this.profileManager.userProfilePromise
			.then((profile) => profile.emails.loadedPromise)
			.then((emails) => (this.profileEmails = emails.entities));
	}

	ngOnInit(): void {
		this.issuerStaffRequestApiService.getStaffRequestsByIssuer(this.issuerSlug).then((r) => {
			this.staffRequests = r.body;
		});
	}

	staffCreateForm = typedFormGroup()
		.addControl('staffRole', 'staff' as IssuerStaffRoleSlug, Validators.required)
		.addControl('staffEmail', '', [Validators.required, EmailValidator.validEmail]);

	staffRequestRoleForm = typedFormGroup().addControl(
		'staffRole',
		'staff' as IssuerStaffRoleSlug,
		Validators.required,
	);

	submitStaffRequestRoleForm(requestid: string) {
		if (!this.staffRequestRoleForm.markTreeDirtyAndValidate()) {
			return;
		}
		const formData = this.staffRequestRoleForm.value;

		return this.issuerStaffRequestApiService.confirmRequest(this.issuerSlug, requestid).then(
			() => {
				this.issuer.addStaffMember(formData.staffRole, this.selectedStaffRequestEmail);
				this.error = null;
				this.messageService.reportMinorSuccess(
					`Added ${this.selectedStaffRequestEmail} as ${formData.staffRole}`,
				);
				this.closeDialog();
				this.staffRequests = this.staffRequests.filter(
					//@ts-ignore
					(req) => req.user.email != this.selectedStaffRequestEmail,
				);
			},
			(error) => {
				const err = BadgrApiFailure.from(error);
				console.log(err);
				this.error =
					BadgrApiFailure.messageIfThrottableError(err.overallMessage) ||
					''.concat(this.translate.instant('Issuer.addMember_failed'), ': ', err.firstMessage);
			},
		);
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
				this.closeDialog();
				// this.closeModal();
			},
			(error) => {
				const err = BadgrApiFailure.from(error);
				console.log(err);
				this.closeDialog();
				this.error =
					BadgrApiFailure.messageIfThrottableError(err.overallMessage) ||
					''.concat(this.translate.instant('Issuer.addMember_failed'), ': ', err.firstMessage);
			},
		);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Staff Editing

	changeMemberRole(member: IssuerStaffMember, roleSlug: IssuerStaffRoleSlug) {
		member.roleSlug = roleSlug;

		member.save().then(
			() => {
				this.messageService.reportMajorSuccess(
					`${member.nameLabel}'s role has been changed to ${member.roleInfo.label}`,
				);
			},
			(error) =>
				this.messageService.reportHandledError(
					`Failed to edit member: ${BadgrApiFailure.from(error).firstMessage}`,
				),
		);
	}

	memberId(member) {
		return member.email || member.url || member.telephone;
	}

	async removeMember(member: IssuerStaffMember) {
		console.log('member', member);
		if (
			!(await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: `Remove ${member.nameLabel}?`,
				dialogBody: `${member.nameLabel} is ${member.roleInfo.indefiniteLabel} of ${this.issuer.name}. Are you sure you want to remove them from this role?`,
				resolveButtonLabel: `Remove ${member.nameLabel}`,
				rejectButtonLabel: 'Cancel',
			}))
		) {
			return;
		}

		return member.remove().then(
			() => this.messageService.reportMinorSuccess(`Removed ${member.nameLabel} from ${this.issuer.name}`),
			(error) =>
				this.messageService.reportHandledError(
					`Failed to add member: ${BadgrApiFailure.from(error).firstMessage}`,
				),
		);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Staff Creation

	addStaff() {
		this.issuerStaffCreateDialog.openDialog();
		// this.issuerStaffCreateDialog._issuerStaffRoleOptions = this._issuerStaffRoleOptions;
		this.issuerStaffCreateDialog.issuer = this.issuer;
	}

	private readonly _hlmDialogService = inject(HlmDialogService);

	public openDialog(text: string) {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.headerTemplate,
				text: text,
				subtitle: 'Are you sure you want to proceed?',
				content: this.addMemberFormTemplate,
				variant: 'default',
				footer: false,
			},
		});
		this.dialogRef = dialogRef;
	}

	deleteStaffRequest(event) {
		this.issuerStaffRequestApiService.deleteRequest(this.issuerSlug, event).then(() => {
			this.staffRequests = this.staffRequests.filter((req) => req.entity_id != event);
		});
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	confirmStaffRequest(event: ApiStaffRequest) {
		//@ts-ignore
		this.selectedStaffRequestEmail = event.user.email;
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.headerConfirmStaffTemplate,
				content: this.staffRequestRoleTemplate,
				footer: false,
				templateContext: {
					email: this.selectedStaffRequestEmail,
					requestid: event.entity_id,
				},
			},
		});
		this.dialogRef = dialogRef;
		// this.issuerStaffRequestApiService.confirmRequest(this.issuerSlug, event);
	}
}
