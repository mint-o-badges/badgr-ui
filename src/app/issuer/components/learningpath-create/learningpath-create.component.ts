import { Component, OnInit, inject } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { FormBuilder } from '@angular/forms';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerApiService } from '../../services/issuer-api.service';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { LearningPath } from '../../models/learningpath.model';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmH3Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h3.directive';
import { LearningPathEditFormComponent } from '../learningpath-edit-form/learningpath-edit-form.component';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';

@Component({
	selector: 'learningpath-create',
	templateUrl: './learningpath-create.component.html',
	imports: [
		BgBreadcrumbsComponent,
		FormMessageComponent,
		HlmH1Directive,
		HlmH3Directive,
		LearningPathEditFormComponent,
		TranslatePipe,
	],
})
export class LearningPathCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	breadcrumbLinkEntries: LinkEntry[] = [];
	issuerSlug: string;
	issuer: Issuer;

	issuerLoaded: Promise<unknown>;

	constructor(
		protected formBuilder: FormBuilder,
		protected loginService: SessionService,
		protected messageService: MessageService,
		protected learningPathApiService: LearningPathApiService,
		protected issuerManager: IssuerManager,
		protected issuerApiService: IssuerApiService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected badgeClassService: BadgeClassManager,
		private translate: TranslateService,
		protected badgeInstanceManager: BadgeInstanceManager,
		// protected title: Title,
	) {
		super(router, route, loginService);
		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
			this.breadcrumbLinkEntries = [
				{ title: 'Issuers', routerLink: ['/issuer'] },
				{
					title: this.issuer.name,
					routerLink: ['/issuer/issuers', this.issuerSlug],
				},
			];
		});
	}

	ngOnInit() {}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text: this.translate.instant('LearningPath.createdSuccessfully'),
				variant: 'success',
			},
		});
	}

	learningPathCreated(promise: Promise<LearningPath | ApiLearningPath>) {
		promise.then(
			(lp) => {
				this.router.navigate(['issuer/issuers', this.issuerSlug, 'learningpaths', lp.slug]).then(() => {
					this.openSuccessDialog();
				});
			},
			(error) =>
				this.messageService.reportAndThrowError(
					`Unable to create Badge Class: ${BadgrApiFailure.from(error).firstMessage}`,
					error,
				),
		);
	}
	creationCanceled() {
		this.router.navigate(['issuer/issuers', this.issuerSlug]);
	}
}
