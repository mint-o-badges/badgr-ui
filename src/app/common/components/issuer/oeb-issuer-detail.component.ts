import { Component, Input, OnInit, Output, EventEmitter, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { Issuer } from '../../../issuer/models/issuer.model';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { MatchingAlgorithm } from '../../dialogs/fork-badge-dialog/fork-badge-dialog.component';
import { MenuItem } from '../badge-detail/badge-detail.component.types';
import { TranslateService } from '@ngx-translate/core';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { DangerDialogComponentTemplate } from '../../dialogs/oeb-dialogs/danger-dialog-template.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { BadgeRequestApiService } from '../../../issuer/services/badgerequest-api.service';
import { InfoDialogComponent } from '../../dialogs/oeb-dialogs/info-dialog.component';
import { QrCodeApiService } from '../../../issuer/services/qrcode-api.service';

@Component({
    selector: 'oeb-issuer-detail',
    templateUrl: './oeb-issuer-detail.component.html',
    styleUrl: './oeb-issuer-detail.component.scss',
    standalone: false
})
export class OebIssuerDetailComponent implements OnInit {

    @Input() issuer: Issuer;
    @Input() issuerPlaceholderSrc: string;
    @Input() issuerActionsMenu: any;
    @Input() badges: BadgeClass[];
    @Input() learningPaths: ApiLearningPath[];
    @Input() public: boolean = false;
    @Output() issuerDeleted = new EventEmitter();

	learningPathsPromise: Promise<unknown>;

	constructor(
		private router: Router,
		public translate: TranslateService,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		private configService: AppConfigService,
		private learningPathApiService: LearningPathApiService,
		private qrCodeApiService: QrCodeApiService
	) {

	};
    private readonly _hlmDialogService = inject(HlmDialogService);

	menuItemsPublic: MenuItem[] = [
		{
			title: this.translate.instant('Issuer.jsonView'),
			action: (a:any) => this.routeToJson(),
			// action: (a:any) => this.delete(a),
			icon: 'lucideFileQuestion',
		}
	]

	menuItems: MenuItem[] = [
		{
			title: this.translate.instant('General.edit'),
			routerLink: ['./edit'],
			icon: 'lucidePencil',
		},
		{
			title: this.translate.instant('General.delete'),
			// routerLink: ['/catalog/badges'],
			action: (a:any) => this.delete(a),
			icon: 'lucideTrash2',
		},
		{
			title: this.translate.instant('General.members'),
			routerLink: ['./staff'],
			icon: 'lucideUsers',
		},
	]

	tabs: any = undefined;
	activeTab = 'Badges';

	@ViewChild('badgesTemplate', { static: true }) badgesTemplate: ElementRef;
	@ViewChild('learningPathTemplate', { static: true }) learningPathTemplate: ElementRef;

	ngAfterContentInit() {
		this.tabs = [

			{
				title: 'Badges',
				component: this.badgesTemplate,
			},
			{
				title: 'Micro Degrees',
				component: this.learningPathTemplate,
			},
		];
	}

	badgeResults: BadgeResult[] = [];
	maxDisplayedResults = 100;

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	private updateResults() {
		// Clear Results
		this.badgeResults.length = 0;

		const addBadgeToResults = (badge: BadgeClass) => {
			// Restrict Length
			if (this.badgeResults.length > this.maxDisplayedResults) {
				return false;
			}
			if(badge.extension && badge.extension['extensions:CategoryExtension'].Category === "learningpath"){
				return false;
			}

			this.badgeResults.push(new BadgeResult(badge, this.issuer.name, 0));

			return true;
		};

		this.badges.filter(MatchingAlgorithm.badgeMatcher(this._searchQuery)).forEach(addBadgeToResults);
		this.badgeResults.sort((a, b) => b.badge.createdAt.getTime() - a.badge.createdAt.getTime());
	}

	ngOnInit() {
		this.updateResults();
		if(!this.public)
			this.getLearningPathsForIssuerApi(this.issuer.slug);
	}

    delete(event){
        this.issuerDeleted.emit(event);
    }

    routeToBadgeAward(badge: BadgeClass, issuer){
		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
			if(badge.recipientCount === 0 && qrCodes.length === 0){
				const dialogRef =this._hlmDialogService.open(InfoDialogComponent, {
					context: {
						variant: "info",
						caption: this.translate.instant("Badge.endOfEditDialogTitle"),
						subtitle: this.translate.instant("Badge.endOfEditDialogText"),
						text: this.translate.instant("Badge.endOfEditDialogSubText"),
						cancelText: this.translate.instant('General.cancel'),
						forwardText: this.translate.instant('Issuer.giveBadge')
					},
				})
				dialogRef.closed$.subscribe((result) => {
					if (result === 'continue') this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
				});
			}
			else{
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue'])
			}
		});
	}

	routeToQRCodeAward(badge, issuer){
		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
			if(badge.recipientCount === 0 && qrCodes.length === 0){
				const dialogRef =this._hlmDialogService.open(InfoDialogComponent, {
					context: {
						variant: "info",
						caption: this.translate.instant("Badge.endOfEditDialogTitle"),
						subtitle: this.translate.instant("Badge.endOfEditDialogTextQR"),
						text: this.translate.instant("Badge.endOfEditDialogSubText"),
						cancelText: this.translate.instant('General.previous'),
						forwardText: this.translate.instant('Issuer.giveQr')
					},
				})
				dialogRef.closed$.subscribe((result) => {
					if (result === 'continue') this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
				});
			}
			else{
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr'])
			}
		})
	}

	routeToBadgeDetail(badge, issuer){
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug])
	}
	redirectToLearningPathDetail(learningPathSlug, issuer){
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'learningpaths', learningPathSlug])
	}

	public deleteLearningPath(learningPathSlug, issuer) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponentTemplate, {
			context: {
				delete: () => this.deleteLearningPathApi(learningPathSlug, issuer),
				// qrCodeRequested: () => {},
				variant: "danger",
				text: "Möchtest du diesen Micro Degree wirklich löschen?",
				title: "Micro Degree löschen"
			},
		});
	}

	deleteLearningPathApi(learningPathSlug, issuer){
		this.learningPathApiService.deleteLearningPath(issuer.slug, learningPathSlug).then(
			() => this.learningPaths = this.learningPaths.filter(value => value.slug != learningPathSlug)
		);
	}

	getLearningPathsForIssuerApi(issuerSlug){
		this.learningPathsPromise = this.learningPathApiService.getLearningPathsForIssuer(issuerSlug).then(
			(learningPaths) => this.learningPaths = learningPaths.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
		);
	}

	get rawJsonUrl() {
		if(this.issuer)
			return `${this.configService.apiConfig.baseUrl}/public/issuers/${this.issuer.slug}.json`;
	}

	routeToJson() {
		window.open(`${this.configService.apiConfig.baseUrl}/public/issuers/${this.issuer.slug}.json`, '_blank')
	}

	routeToUrl(url){
		window.location.href = url;
	}

	onTabChange(tab) {
		this.activeTab = tab;
	}

	calculateStudyLoad(lp: any): number {
		const totalStudyLoad = lp.badges.reduce((acc, b) => acc + b.badge['extensions:StudyLoadExtension'].StudyLoad, 0);
		return totalStudyLoad;
	}
}

class BadgeResult {
	constructor(
		public badge: BadgeClass,
		public issuerName: string,
		public requestCount: number
	) {}
}
