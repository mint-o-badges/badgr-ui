import { AfterContentInit, Component, ElementRef, Injector, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import { PublicApiIssuer, PublicApiLearningPath } from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { UserProfileApiService } from '../../../common/services/user-profile-api.service';
import { TranslateService } from '@ngx-translate/core';
import { Issuer } from '../../../issuer/models/issuer.model';
import { IssuerApiService } from '../../../issuer/services/issuer-api.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';

@Component({
	templateUrl: './learningpath.component.html',
})
export class PublicLearningPathComponent implements OnInit, AfterContentInit {

	learningPathSlug: string;

	isParticipating: boolean = false;

	learningPath;
	learningPathIdParam: LoadedRouteParam<PublicApiLearningPath >;
	participationButtonText: string = "Teilnehmen"; 
	issuerLoaded: Promise<unknown>;
	badgeLoaded: Promise<unknown>;
	loaded;
	issuer: PublicApiIssuer;
	badge: any;
	tabs:any = undefined;
	activeTab = 'Alle'

	@ViewChild('allTemplate', { static: true }) allTemplate: ElementRef;
	@ViewChild('openTemplate', { static: true }) openTemplate: ElementRef;
	@ViewChild('finishedTemplate', { static: true }) finishedTemplate: ElementRef;

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		public publicService: PublicApiService,
		private learningPathApiService: LearningPathApiService,
		protected userProfileApiService: UserProfileApiService,
		protected translate: TranslateService,
		public issuerManager: IssuerManager,
		private title: Title,
		) {
		title.setTitle(`LearningPath - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		
		this.loaded = new LoadedRouteParam(injector.get(ActivatedRoute), 'learningPathId', (paramValue) => {
			this.learningPathSlug = paramValue;
			const service: PublicApiService = injector.get(PublicApiService);
			

			this.userProfileApiService.getProfile().then(
				(response) => {
					let userSlug = response['slug'];
					if(userSlug){
						this.learningPathApiService.getLearningPathParticipants(this.learningPathSlug).then(
							(response) => {
								if(response.body){
									const participants = response.body
									participants.forEach((participant) => {
										if(participant.user['slug'] == userSlug){
											this.participationButtonText = this.translate.instant('LearningPath.notParticipateAnymore');
										}
									});
								}
							}, 
						);
					}
				}
			)
			return service.getLearningPath(paramValue).then((res)=> {
				this.learningPath = res;
				this.issuerLoaded = this.publicService.getIssuer(res.issuer_id).then(
					(issuer) => {
						console.log(issuer)
						this.issuer = issuer;
					});
				this.badgeLoaded = this.publicService.getBadgeClass(res.participationBadge_id).then(
					(badge) => {
						console.log(badge)
						this.badge = badge;
						return badge;
					}
				);
			});
		});
	}

	ngOnInit(): void {
	
	}

	ngAfterContentInit() {
		this.tabs = [
			{
				title: 'Alle',
				component: this.allTemplate,
			},
			{
				title: 'Offen',
				component: this.openTemplate,
			},
			{
				title: 'Abgeschlossen',
				component: this.finishedTemplate,
			},
		];
	}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text: `Du nimmst am Lernpfad ${this.learningPath.name} teil!`,
				variant: 'success',
			},
		});
	}


	participate(){
		this.learningPathApiService.participateInLearningPath(this.learningPathSlug).then(
			(response) => {
				this.openSuccessDialog();
			},
			(err) => {
				console.log(err);
			}
		)

	}

	onTabChange(tab) {
		this.activeTab = tab;
	}

}
