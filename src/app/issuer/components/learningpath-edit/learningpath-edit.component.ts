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
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { BadgeClass } from '../../models/badgeclass.model';
import { BadgeClassApiService } from '../../services/badgeclass-api.service';
import { LearningPathManager } from '../../services/learningpath-manager.service';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { LearningPathEditFormComponent } from '../learningpath-edit-form/learningpath-edit-form.component';
import { HlmH1, HlmH3 } from '@spartan-ng/helm/typography';

@Component({
	selector: 'learningpath-edit',
	templateUrl: './learningpath-edit.component.html',
	imports: [
		BgBreadcrumbsComponent,
		FormMessageComponent,
		HlmH1,
		HlmH3,
		BgAwaitPromises,
		LearningPathEditFormComponent,
		TranslatePipe,
	],
})
export class LearningPathEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	breadcrumbLinkEntries: LinkEntry[] = [];
	issuerSlug: string;
	lpSlug: string;
	issuer: Issuer;

	issuerLoaded: Promise<unknown>;
	learningPathLoaded: Promise<unknown>;

	learningPath: LearningPath;

	learningPathBadge: BadgeClass;

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
		protected badgeApiService: BadgeClassApiService,
		private translate: TranslateService,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected learningPathManager: LearningPathManager,
		// protected title: Title,
	) {
		super(router, route, loginService);
		this.issuerSlug = this.route.snapshot.params['issuerSlug'];
		this.lpSlug = this.route.snapshot.params['learningPathSlug'];

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
		this.learningPathLoaded = this.loadLearningPath();
	}

	async loadLearningPath() {
		return new Promise(async (resolve, reject) => {
			this.learningPath = await this.learningPathManager.getLearningPathForIssuer(this.issuerSlug, this.lpSlug);
			this.learningPathBadge = await this.badgeClassService.badgeByIssuerSlugAndSlug(
				this.issuerSlug,
				this.learningPath.participationBadgeId,
			);
			resolve(this.learningPath),
				(error) => {
					this.messageService.reportAndThrowError('Failed to load learningPath', error);
				};
		});
	}

	ngOnInit() {}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text: this.translate.instant('LearningPath.savedSuccessfully'),
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
