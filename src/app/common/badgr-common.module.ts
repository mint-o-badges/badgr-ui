import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BgBadgecard } from './components/bg-badgecard';
import { BgCollectionBadgecard } from './components/bg-collectionbadgecard';

import { BgAwaitPromises } from './directives/bg-await-promises';
import { BgImageStatusPlaceholderDirective } from './directives/bg-image-status-placeholder.directive';
import { MenuItemDirective } from './directives/bg-menuitem.directive';
import { ScrollPinDirective } from './directives/scroll-pin.directive';
import { BadgeImageComponent } from './components/badge-image.component';
import { ConfirmDialog } from './dialogs/confirm-dialog.component';
import { NewTermsDialog } from './dialogs/new-terms-dialog.component';
import { ConnectedBadgeComponent } from './components/connected-badge.component';
import { TruncatedTextComponent } from './components/truncated-text.component';
import { TooltipComponent } from './components/tooltip.component';

import { FormMessageComponent } from './components/form-message.component';
import { FormFieldText } from './components/formfield-text';
import { FormFieldRadio } from './components/formfield-radio';
import { FormFieldMarkdown } from './components/formfield-markdown';
import { FormFieldSelect } from './components/formfield-select';
import { LoadingDotsComponent } from './components/loading-dots.component';
import { LoadingErrorComponent } from './components/loading-error.component';
import { BgIssuerLinkComponent } from './components/issuer-link.component';
import { BgFormFieldImageComponent } from './components/formfield-image';
import { BgFormFieldFileComponent } from './components/formfield-file';
import { CommonDialogsService } from './services/common-dialogs.service';
import { CommonEntityManager } from '../entity-manager/services/common-entity-manager.service';
import { SessionService } from './services/session.service';
import { MessageService } from './services/message.service';
import { SettingsService } from './services/settings.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UcFirstPipe } from './pipes/ucfirst.pipe';
// import { TooltipDirective } from "./directives/tooltip.directive";
import { BgCopyInputDirective } from './directives/bg-copy-input.directive';
import { ShareSocialDialog } from './dialogs/share-social-dialog/share-social-dialog.component';
import { TimeComponent } from './components/time.component';
import { BadgrButtonComponent } from './components/badgr-button.component';
import { SharingService } from './services/sharing.service';
import { NounprojectService } from './services/nounproject.service';
import { EventsService } from './services/events.service';
import { ForwardRouteComponent } from './pages/forward-route.component';
import { MarkdownDisplay } from './components/markdown-display';
import { ShowMore } from './components/show-more.component';
import { QueryParametersService } from './services/query-parameters.service';
import { UserProfileManager } from './services/user-profile-manager.service';
import { UserProfileApiService } from './services/user-profile-api.service';
import { OAuthApiService } from './services/oauth-api.service';
import { OAuthManager } from './services/oauth-manager.service';
import { AuthGuard } from './guards/auth.guard';
import { OAuthBannerComponent } from './components/oauth-banner.component';
import { EmbedService } from './services/embed.service';
import { InitialLoadingIndicatorService } from './services/initial-loading-indicator.service';
import { ExternalToolsManager } from '../externaltools/services/externaltools-manager.service';
import { ExternalToolsApiService } from '../externaltools/services/externaltools-api.service';
import { ExternalToolLaunchComponent } from './components/external-tool-launch.component';
import { AppConfigService } from './app-config.service';
import { HttpClientModule } from '@angular/common/http';
import { AutosizeDirective } from './directives/autosize.directive';
import { NavigationService } from './services/navigation.service';
import { BgPopupMenu, BgPopupMenuTriggerDirective } from './components/bg-popup-menu.component';
import { SvgIconComponent } from './components/svg-icon.component';
import { BgMarkdownComponent } from './directives/bg-markdown.component';
import { BgBreadcrumbsComponent } from './components/bg-breadcrumbs/bg-breadcrumbs.component';
import { CopyBadgeDialog } from './dialogs/copy-badge-dialog/copy-badge-dialog.component';
import { ForkBadgeDialog } from './dialogs/fork-badge-dialog/fork-badge-dialog.component';
import { MarkdownHintsDialog } from './dialogs/markdown-hints-dialog.component';
import { IssuerManager } from '../issuer/services/issuer-manager.service';
import { IssuerApiService } from '../issuer/services/issuer-api.service';
import { ZipService } from './util/zip-service/zip-service.service';
import { BadgeLegendComponent } from './components/badge-legend/badge-legend.component';
import { NounprojectDialog } from './dialogs/nounproject-dialog/nounproject-dialog.component';

import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { ExportPdfDialog } from './dialogs/export-pdf-dialog/export-pdf-dialog.component';
import { BadgeClassManager } from '../issuer/services/badgeclass-manager.service';
import { BadgeClassApiService } from '../issuer/services/badgeclass-api.service';
import { TranslateModule } from '@ngx-translate/core';

const DIRECTIVES = [
	BgAwaitPromises,
	BgImageStatusPlaceholderDirective,
	MenuItemDirective,
	ScrollPinDirective,
	BgCopyInputDirective,
	AutosizeDirective,
	BgMarkdownComponent,
	// TooltipDirective,
	BgPopupMenuTriggerDirective,
];

export const COMMON_MODULE_COMPONENTS = [
	BadgeImageComponent,
	BadgrButtonComponent,
	BgBadgecard,
	BgCollectionBadgecard,
	BgBreadcrumbsComponent,
	BgFormFieldFileComponent,
	BgFormFieldImageComponent,
	BgIssuerLinkComponent,
	BgPopupMenu,
	ConfirmDialog,
	ConnectedBadgeComponent,
	ExternalToolLaunchComponent,
	FormFieldMarkdown,
	FormFieldSelect,
	FormFieldText,
	FormFieldRadio,
	FormMessageComponent,
	LoadingDotsComponent,
	LoadingErrorComponent,
	MarkdownDisplay,
	NewTermsDialog,
	OAuthBannerComponent,
	ShareSocialDialog,
	CopyBadgeDialog,
	ForkBadgeDialog,
	MarkdownHintsDialog,
	ShowMore,
	SvgIconComponent,
	TimeComponent,
	TooltipComponent,
	TruncatedTextComponent,
	ExportPdfDialog,
	NounprojectDialog
];

const SERVICES = [
	CommonDialogsService,
	CommonEntityManager,
	IssuerManager,
	IssuerApiService,
	MessageService,
	SettingsService,
	SharingService,
	NounprojectService,
	EventsService,
	SessionService,
	QueryParametersService,
	UserProfileManager,
	UserProfileApiService,
	OAuthManager,
	OAuthApiService,
	EmbedService,
	InitialLoadingIndicatorService,
	ExternalToolsApiService,
	ExternalToolsManager,
	AppConfigService,
	NavigationService,
	ZipService
];

const GUARDS = [AuthGuard];

const PIPES = [UcFirstPipe];

export const COMMON_IMPORTS = [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		FormsModule,
		LMarkdownEditorModule,
		TranslateModule
	],
	providers: [
		BadgeClassManager,
		BadgeClassApiService
	],
	declarations: [...DIRECTIVES, ...COMMON_MODULE_COMPONENTS, ...PIPES, ForwardRouteComponent, BadgeLegendComponent],
	exports: [...DIRECTIVES, ...COMMON_MODULE_COMPONENTS, ...PIPES, BadgeLegendComponent],
})
export class BadgrCommonModule {
	// Load BadgrCommonModule with forRoot() to preserve singleton status in lazy loaded modules.
	// see: https://www.youtube.com/watch?v=SBSnsNHQYo4
	static forRoot(): ModuleWithProviders<BadgrCommonModule> {
		return {
			ngModule: BadgrCommonModule,
			providers: [...SERVICES, ...GUARDS],
		};
	}
}
