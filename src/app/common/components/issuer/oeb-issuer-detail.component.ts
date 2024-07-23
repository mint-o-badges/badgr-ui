import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfileEmail } from '../../../common/model/user-profile.model';
import { AppConfigService } from '../../../common/app-config.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { Issuer } from '../../../issuer/models/issuer.model';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { ApiExternalToolLaunchpoint } from '../../../externaltools/models/externaltools-api.model';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { BadgeClassManager } from '../../..//issuer/services/badgeclass-manager.service';
import { ExternalToolsManager } from '../../..//externaltools/services/externaltools-manager.service';
import { stripQueryParamsFromUrl } from '../../util/url-util';
import { MatchingAlgorithm } from '../../dialogs/fork-badge-dialog/fork-badge-dialog.component';

@Component({
	selector: 'oeb-issuer-detail',
	templateUrl: './oeb-issuer-detail.component.html',
	styleUrl: './oeb-issuer-detail.component.scss',
})
export class OebIssuerDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

    @Input() issuer: Issuer;
    @Input() issuerPlaceholderSrc: string;
    @Input() issuerActionsMenu: any;
    @Input() badges: BadgeClass[];
    @Input() public: boolean = false;
    @Output() issuerDeleted = new EventEmitter();

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		private configService: AppConfigService,
		private badgeClassManager: BadgeClassManager,
	) {
        super(router, route, loginService);
	};

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
		super.ngOnInit();
		this.updateResults();
	}

    delete(event){
        this.issuerDeleted.emit(event);
    }

    routeToBadgeAward(badge, issuer){
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue'])
	}

	routeToBadgeDetail(badge, issuer){
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug])
	}

	get rawJsonUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/issuers/${this.issuer.slug}.json`;
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