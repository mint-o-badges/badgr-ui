import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
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

@Component({
	selector: 'oeb-issuer-detail',
	templateUrl: './oeb-issuer-detail.component.html',
	styleUrl: './oeb-issuer-detail.component.scss',
})
export class OebIssuerDetailComponent implements OnInit {

    @Input() issuer: Issuer;
    @Input() issuerPlaceholderSrc: string;
    @Input() issuerActionsMenu: any;
    @Input() badges: BadgeClass[];
    @Input() public: boolean = false;
    @Output() issuerDeleted = new EventEmitter();

	constructor(
		private router: Router,
		public translate: TranslateService,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		private configService: AppConfigService,
	) {
        
	};

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
			icon: 'lucideUsers',
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
			icon: 'lucideWarehouse',
		},
	]

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


			if (!this.badgeResults.find((r) => r.badge === badge)) {
				// appending the results to the badgeResults array bound to the view template.
				this.badgeResults.push(new BadgeResult(badge, this.issuer.name));
			}
			return true;
		};

		this.badges.filter(MatchingAlgorithm.badgeMatcher(this._searchQuery)).forEach(addBadgeToResults);
		this.badgeResults.sort((a, b) => b.badge.createdAt.getTime() - a.badge.createdAt.getTime());
	}

	ngOnInit() {
		// super.ngOnInit();
		this.updateResults();
	}

    delete(event){
        this.issuerDeleted.emit(event);
    }

    routeToBadgeAward(badge, issuer){
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue'])
	}

	routeToQRCodeAward(badge, issuer){
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr'])
	}

	routeToBadgeDetail(badge, issuer){
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug])
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
}

class BadgeResult {
	constructor(
		public badge: BadgeClass,
		public issuerName: string,
	) {}
}