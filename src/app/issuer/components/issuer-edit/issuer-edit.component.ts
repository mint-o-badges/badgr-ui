import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';

import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { Title } from '@angular/platform-browser';
import { Issuer } from '../../models/issuer.model';

import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { IssuerEditFormComponent } from '../issuer-edit-form/issuer-edit-form.component';

@Component({
    selector: 'issuer-edit',
    templateUrl: './issuer-edit.component.html',
    imports: [
        FormMessageComponent,
        BgBreadcrumbsComponent,
        HlmH1Directive,
        HlmPDirective,
        IssuerEditFormComponent,
        TranslatePipe,
    ],
})
export class IssuerEditComponent extends BaseAuthenticatedRoutableComponent {
	issuer: Issuer;
	issuerSlug: string;

	issuerLoaded: Promise<unknown>;

	editIssuerCrumbs: LinkEntry[];

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected profileManager: UserProfileManager,
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected issuerManager: IssuerManager,
		protected translate: TranslateService,
	) {
		super(router, route, loginService);
		title.setTitle(`Edit Issuer - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => {
				this.issuer = issuer;

				this.editIssuerCrumbs = [
					{ title: 'Issuers', routerLink: ['/issuer'] },
					{ title: issuer.name, routerLink: ['/issuer/issuers/', this.issuerSlug] },
					{ title: 'Edit Issuer' },
				];

				this.title.setTitle(
					`Issuer - ${this.issuer.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
				);
			},
			(error) => {
				this.messageService.reportLoadingError(`Issuer '${this.issuerSlug}' does not exist.`, error);
			},
		);
	}
}
