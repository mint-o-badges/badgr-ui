import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BadgrCommonModule, COMMON_IMPORTS } from '../common/badgr-common.module';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { IssuerListComponent } from './components/issuer-list/issuer-list.component';
import { IssuerCreateComponent } from './components/issuer-create/issuer-create.component';
import { IssuerDetailComponent } from './components/issuer-detail/issuer-detail.component';
import { IssuerEditComponent } from './components/issuer-edit/issuer-edit.component';
import { BadgeClassCreateComponent } from './components/badgeclass-create/badgeclass-create.component';
import { BadgeClassEditComponent } from './components/badgeclass-edit/badgeclass-edit.component';
import { BadgeClassDetailComponent } from './components/badgeclass-detail/badgeclass-detail.component';
import { BadgeClassIssueComponent } from './components/badgeclass-issue/badgeclass-issue.component';
import { BadgeClassIssueBulkAwardComponent } from './components/badgeclass-issue-bulk-award/badgeclass-issue-bulk-award.component';
import { BadgeClassIssueBulkAwardPreviewComponent } from './components/badgeclass-issue-bulk-award-preview/badgeclass-issue-bulk-award-preview.component';
import { BadgeclassIssueBulkAwardConformation } from './components/badgeclass-issue-bulk-award-confirmation/badgeclass-issue-bulk-award-confirmation.component';
import { BadgeclassIssueBulkAwardError } from './components/badgeclass-issue-bulk-award-error/badgeclass-issue-bulk-award-error.component';
import { BadgeInstanceManager } from './services/badgeinstance-manager.service';
import { BadgeInstanceApiService } from './services/badgeinstance-api.service';
import { BadgeClassManager } from './services/badgeclass-manager.service';
import { BadgeClassApiService } from './services/badgeclass-api.service';
import { IssuerManager } from './services/issuer-manager.service';
import { IssuerApiService } from './services/issuer-api.service';
import { BadgeSelectionDialog } from './components/badge-selection-dialog/badge-selection-dialog.component';
import { BadgeStudioComponent } from './components/badge-studio/badge-studio.component';
import { BadgeClassIssueBulkAwardImportComponent } from './components/badgeclass-issue-bulk-award-import/badgeclass-issue-bulk-award-import.component';
import { CommonEntityManagerModule } from '../entity-manager/entity-manager.module';
import { IssuerStaffComponent } from './components/issuer-staff/issuer-staff.component';
import { BadgeClassEditFormComponent } from './components/badgeclass-edit-form/badgeclass-edit-form.component';
import { IssuerStaffCreateDialogComponent } from './components/issuer-staff-create-dialog/issuer-staff-create-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { QrCodeDatatableComponent } from '../components/datatable-qrcodes.component';
import { IssuerDetailDatatableComponent } from '../components/datatable-issuer-detail.component';
import { CompetencyAccordionComponent } from '../components/accordion.component';
import { BadgeClassEditQrComponent } from './components/badgeclass-edit-qr/badgeclass-edit-qr.component';
import { BadgeClassIssueQrComponent } from './components/badgeclass-issue-qr/badgeclass-issue-qr.component';
import { BadgeClassGenerateQrComponent } from './components/badgeclass-generate-qr/badgeclass-generate-qr.component';
import { QrCodeAwardsComponent } from './components/qrcode-awards/qrcode-awards.component';
import { QrCodeApiService } from './services/qrcode-api.service';
import { BadgeRequestApiService } from './services/badgerequest-api.service';
import { EditQrFormComponent } from './components/edit-qr-form/edit-qr-form.component';
import { LearningPathCreateComponent } from './components/learningpath-create/learningpath-create.component';
import { LearningPathEditFormComponent } from './components/learningpath-edit-form/learningpath-edit-form.component';
import { DndModule } from 'ngx-drag-drop';
import { LearningPathManager } from './services/learningpath-manager.service';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkStepper } from '@angular/cdk/stepper';
import { StepperComponent } from '../components/stepper/stepper.component';
import { StepComponent } from '../components/stepper/step.component';
import { LearningPathDetailsComponent } from './components/learningpath-create-steps/learningpath-details/learningpath-details.component';
import { LearningPathBadgesComponent } from './components/learningpath-create-steps/learningpath-badges/learningpath-badges.component';
import { LearningPathBadgeOrderComponent } from './components/learningpath-create-steps/learningpath-badge-order/learningpath-badge-order.component';
import { LearningPathTagsComponent } from './components/learningpath-create-steps/learningpath-tags/learningpath-tags.component';
import { LearningPathUploadComponent } from './components/learningpath-upload/learningpath-upload.component';
import { IssuerLearningPathComponent } from './components/issuer-learning-path/issuer-learning-path.component';
import { IssuerEditFormComponent } from './components/issuer-edit-form/issuer-edit-form.component';
import { Issuer } from './models/issuer.model';
import { LearningPathEditComponent } from './components/learningpath-edit/learningpath-edit.component';
import { BadgeClassSelectTypeComponent } from './components/badgeclass-select-type/badgeclass-select-type.component';
import { BadgeClassEditCopyPermissionsComponent } from './components/badgeclass-edit-copypermissions/badgeclass-edit-copypermissions';

const routes = [
	/* Issuer */
	{
		path: '',
		component: IssuerListComponent,
	},
	{
		path: 'create',
		component: IssuerCreateComponent,
	},
	{
		path: 'issuers/:issuerSlug',
		component: IssuerDetailComponent,
	},
	{
		path: 'issuers/:issuerSlug/edit',
		component: IssuerEditComponent,
	},
	{
		path: 'issuers/:issuerSlug/staff',
		component: IssuerStaffComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/select',
		component: BadgeClassSelectTypeComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/create/:category',
		component: BadgeClassCreateComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/create',
		component: BadgeClassCreateComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug',
		component: BadgeClassDetailComponent,
	},
	{
		path: 'issuers/:issuerSlug/learningpaths/upload',
		component: LearningPathUploadComponent,
	},
	{
		path: 'issuers/:issuerSlug/learningpaths/create',
		component: LearningPathCreateComponent,
	},
	{
		path: 'issuers/:issuerSlug/learningpaths/:learningPathSlug/edit',
		component: LearningPathEditComponent,
	},
	{
		path: 'issuers/:issuerSlug/learningpaths/:learningPathSlug',
		component: IssuerLearningPathComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug/qr',
		component: BadgeClassIssueQrComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug/qr/:qrCodeId/edit',
		component: BadgeClassEditQrComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug/qr/:qrCodeId/generate',
		component: BadgeClassGenerateQrComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug/edit',
		component: BadgeClassEditComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug/copypermissions',
		component: BadgeClassEditCopyPermissionsComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug/issue',
		component: BadgeClassIssueComponent,
	},
	{
		path: 'issuers/:issuerSlug/badges/:badgeSlug/bulk-import',
		component: BadgeClassIssueBulkAwardComponent,
	},
	{
		path: '**',
		component: IssuerListComponent,
	},
];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		AutocompleteLibModule,
		BadgrCommonModule,
		CommonEntityManagerModule,
		RouterModule.forChild(routes),
		TranslateModule,
		CompetencyAccordionComponent,
		QrCodeDatatableComponent,
		IssuerDetailDatatableComponent,
		QrCodeAwardsComponent,
		DndModule,
		CdkStepperModule,
	],
	declarations: [
		BadgeClassSelectTypeComponent,
		BadgeClassCreateComponent,
		BadgeClassEditComponent,
		BadgeClassEditCopyPermissionsComponent,
		BadgeClassEditFormComponent,
		BadgeClassIssueComponent,
		BadgeClassIssueQrComponent,
		BadgeClassEditQrComponent,
		BadgeClassGenerateQrComponent,
		BadgeClassDetailComponent,
		EditQrFormComponent,

		BadgeClassIssueBulkAwardComponent,
		BadgeClassIssueBulkAwardImportComponent,
		LearningPathUploadComponent,
		LearningPathCreateComponent,
		LearningPathEditComponent,
		LearningPathEditFormComponent,
		LearningPathDetailsComponent,
		LearningPathBadgesComponent,
		LearningPathBadgeOrderComponent,
		LearningPathTagsComponent,
		BadgeClassIssueBulkAwardPreviewComponent,
		BadgeclassIssueBulkAwardError,
		BadgeclassIssueBulkAwardConformation,

		BadgeClassIssueComponent,
		BadgeSelectionDialog,
		BadgeStudioComponent,

		IssuerCreateComponent,
		IssuerDetailComponent,
		IssuerEditComponent,
		IssuerEditFormComponent,
		IssuerStaffComponent,
		IssuerListComponent,

		IssuerStaffCreateDialogComponent,
		IssuerLearningPathComponent,
		StepperComponent,
		StepComponent,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	exports: [],
	providers: [
		BadgeClassApiService,
		BadgeClassManager,
		LearningPathManager,
		BadgeInstanceApiService,
		BadgeInstanceManager,
		IssuerApiService,
		IssuerManager,
		QrCodeApiService,
		BadgeRequestApiService,
		CdkStepper,
	],
})
export class IssuerModule {}
