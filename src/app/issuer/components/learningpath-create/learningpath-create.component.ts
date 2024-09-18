import { Component } from "@angular/core";
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { FormBuilder, Validators } from "@angular/forms";
import { SessionService } from "../../../common/services/session.service";
import { MessageService } from "../../../common/services/message.service";
import { IssuerManager } from "../../services/issuer-manager.service";
import { LearningPathApiService } from "../../../common/services/learningpath-api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LinkEntry } from "../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component";
import { BadgeClassManager } from "../../services/badgeclass-manager.service";
import { BadgeClass } from "../../models/badgeclass.model";
import { sortUnique } from "../../../catalog/components/badge-catalog/badge-catalog.component";
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import {
	DndDraggableDirective,
	DndDropEvent,
	DndDropzoneDirective,
	DndHandleDirective,
	DndPlaceholderRefDirective,
	DropEffect,
	EffectAllowed,
	DndModule
  } from 'ngx-drag-drop';
import { typedFormGroup } from "../../../common/util/typed-forms";

interface DraggableItem {
	content: string;
	effectAllowed: EffectAllowed;
	disable: boolean;
	handle: boolean;
}

@Component({
	selector: 'learningpath-create',
	templateUrl: './learningpath-create.component.html',
})
export class LearningPathCreateComponent extends BaseAuthenticatedRoutableComponent {

	breadcrumbLinkEntries: LinkEntry[] = [];
	badgesLoaded: Promise<unknown>;
	badges: BadgeClass[] = null;
	badgeResults: BadgeClass[] = null;
    draggableList: any[];
	badgeResultsByIssuer: MatchingBadgeIssuer[] = [];
	badgeResultsByCategory: MatchingBadgeCategory[] = [];
	tags: string[] = [];
	issuers: string[] = [];
	selectedTag: string = null;

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	private _groupBy = '---';
	get groupBy() {
		return this._groupBy;
	}
	set groupBy(val: string) {
		this._groupBy = val;
		this.updateResults();
	}

	private _selectedBadges = [];
	get selectedBadges() {
		return this._selectedBadges;
	}
	set selectedBadges(val: any) {
		console.log(val)
		this._selectedBadges = val;
	}


    constructor(
		protected formBuilder: FormBuilder,
		protected loginService: SessionService,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected learningPathApiService: LearningPathApiService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected badgeClassService: BadgeClassManager,

		// protected title: Title,
	) {
		super(router, route, loginService);
		this.badgesLoaded = this.loadBadges();
    }

    learningPathForm = typedFormGroup()
		.addControl('lp_name', '', [
			Validators.required,
			Validators.maxLength(60)])
		.addControl('lp_image', '')
		.addControl('lp_customImage', '')
		.addControl('lp_description', '', [Validators.required, Validators.maxLength(700)])
		.addArray(
			'badges',
			typedFormGroup()
				.addControl('slug', '', Validators.required)
				.addControl('order', 0, Validators.required),
		)	

	async loadBadges() {
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.allPublicBadges$.subscribe(
				(badges) => {
					this.badges = badges.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					this.badgeResults = this.badges;
					badges.forEach((badge) => {
						this.tags = this.tags.concat(badge.tags);
						this.issuers = this.issuers.concat(badge.issuer);
					});
					this.tags = sortUnique(this.tags);
					this.issuers = sortUnique(this.issuers);
					this.updateResults();
					resolve(badges);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load badges', error);
				},
			);
		});
	}	

	private badgeMatcher(inputPattern: string): (badge) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => StringMatchingUtil.stringMatches(badge.name, patternStr, patternExp);
	}

	private badgeTagMatcher(tag: string) {
		return (badge) => (tag ? badge.tags.includes(tag) : true);
	}

	private updateResults() {
		let that = this;
		// Clear Results
		this.badgeResults = [];
		this.badgeResultsByIssuer = [];
		const badgeResultsByIssuerLocal = {};
		this.badgeResultsByCategory = [];
		const badgeResultsByCategoryLocal = {};

		var addBadgeToResultsByIssuer = function (item) {
			let issuerResults = badgeResultsByIssuerLocal[item.issuerName];

			if (!issuerResults) {
				issuerResults = badgeResultsByIssuerLocal[item.issuerName] = new MatchingBadgeIssuer(
					item.issuerName,
					'',
				);

				// append result to the issuerResults array bound to the view template.
				that.badgeResultsByIssuer.push(issuerResults);
			}

			issuerResults.addBadge(item);

			return true;
		};
		var addBadgeToResultsByCategory = function (item) {
			let itemCategory =
				item.extension && item.extension['extensions:CategoryExtension']
					? item.extension['extensions:CategoryExtension'].Category
					: 'noCategory';
			let categoryResults = badgeResultsByCategoryLocal[itemCategory];

			if (!categoryResults) {
				categoryResults = badgeResultsByCategoryLocal[itemCategory] = new MatchingBadgeCategory(
					itemCategory,
					'',
				);

				// append result to the categoryResults array bound to the view template.
				that.badgeResultsByCategory.push(categoryResults);
			}

			categoryResults.addBadge(item);

			return true;
		};
		this.badges
			.filter(this.badgeMatcher(this.searchQuery))
			.filter(this.badgeTagMatcher(this.selectedTag))
			.filter((i) => !i.apiModel.source_url)
			.forEach((item) => {
				that.badgeResults.push(item);
				addBadgeToResultsByIssuer(item);
				addBadgeToResultsByCategory(item);
			});

		// this.changeOrder(this.order);
		// console.log(this.badgeResultsByIssuer)
        // this.draggableList = this.badgeResults.map((item, index) => {
        //     return {
        //       content: item,
        //       effectAllowed: 'move',
        //       disable: false,
        //       handle: false
        //     };
        //   });
        
          this.draggableList = [
            {
              title: "exDirectory",
              isDirectory: true,
              entries: [
                {
                  title: "file1"
                },
                {
                  title: "file2"
                },
                {
                  title: "file3"
                },
              ]
            },
            {
              title: "exDirectory2",
              isDirectory: true,
              entries: [
                {
                  title: "file4"
                },
                {
                  title: "image5"
                },
                {
                  title: "text6"
                },
              ]
            },
            {
              title: "file7"
            },
            {
              title: "image8"
            },
            {
              title: "text9"
            },
          ]
	}

   
    //  [
    //     {
    //       content: "NextLoop"
    //     },
    //     {
    //       content: "NextLoop"
    //     },
    //     {
    //       content: "Block"
    //     },
    //     {
    //       content: "Block"
    //     }
    //   ];

      onDragged(item: any, list: any[], effect: DropEffect) {

        const index = list.indexOf(item);
        list.splice(index, 1);
      }
    
      onDrop(event: DndDropEvent, list: any[]) {

    
        let index = event.index;
    
        if (typeof index === "undefined") {
    
          index = list.length;
        }

    
        list.splice(index, 0, event.data);
      }
    
}

class MatchingBadgeIssuer {
	constructor(
		public issuerName: string,
		public badge,
		public badges: BadgeClass[] = [],
	) {}

	async addBadge(badge) {
		if (badge.issuerName === this.issuerName) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}

class MatchingBadgeCategory {
	constructor(
		public category: string,
		public badge,
		public badges: BadgeClass[] = [],
	) {}

	async addBadge(badge) {
		if (
			badge.extension &&
			badge.extension['extensions:CategoryExtension'] &&
			badge.extension['extensions:CategoryExtension'].Category === this.category
		) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		} else if (!badge.extension['extensions:CategoryExtension'] && this.category == 'noCategory') {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}