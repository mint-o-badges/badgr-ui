import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ApiRecipientBadgeCollectionForCreation } from '../../models/recipient-badge-collection-api.model';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { sortUnique } from '../../../catalog/components/badge-catalog/badge-catalog.component';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { TranslateService } from '@ngx-translate/core';
import { BadgeClassCategory } from '../../../issuer/models/badgeclass-api.model';

type BadgeResult = BadgeClass & { selected?: boolean };


@Component({
	selector: 'create-recipient-badge-collection',
	templateUrl: './recipient-badge-collection-create.component.html',
	standalone: false,
})
export class RecipientBadgeCollectionCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	badgeCollectionForm = typedFormGroup()
		.addControl('collectionName', '', [Validators.required, Validators.maxLength(128)])
		.addControl('collectionDescription', '', [Validators.required, Validators.maxLength(255)]);

	badgesForm = typedFormGroup().addArray(
		'badges',
		typedFormGroup().addControl('badge', null, Validators.required),
	);		
	createCollectionPromise: Promise<unknown>;
	badgesLoaded: Promise<unknown>;

	badges: BadgeClass[] = null;
	badgeResults: BadgeResult[] = null;
	selectedBadgeUrls: string[] = [];
	selectedBadges: BadgeClass[] = [];
	badgesFormArray: any;

	badgeResultsByIssuer: MatchingBadgeIssuer[] = [];
	badgeResultsByCategory: MatchingBadgeCategory[] = [];
	issuers: string[] = [];
	tags: string[] = [];
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

	groups: string[] = [];
	categoryOptions: { [key in BadgeClassCategory | 'noCategory']: string } = {
		competency: '',
		participation: '',
		learningpath: '',
		noCategory: '',
	};

	constructor(
		router: Router,
		route: ActivatedRoute,
		loginService: SessionService,
		private formBuilder: FormBuilder,
		private title: Title,
		private messageService: MessageService,
		private configService: AppConfigService,
		private recipientBadgeCollectionManager: RecipientBadgeCollectionManager,
		protected badgeClassService: BadgeClassManager,
		private translate: TranslateService,		
	) {
		super(router, route, loginService);

		title.setTitle(`Create Collection - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.badgesLoaded = this.loadBadges();
	}

	ngOnInit() {
		super.ngOnInit();

		this.translate.get('Badge.category').subscribe((translatedText: string) => {
			this.groups[0] = translatedText;
		});

		this.translate.get('Badge.issuer').subscribe((translatedText: string) => {
			this.groups[1] = translatedText;
		});
	}

	badgeChecked(badge: BadgeClass) {
		return this.selectedBadges.includes(badge);
	}

	checkboxChange(event, badge: BadgeClass) {
		if (event) {
			this.selectedBadges.push(badge);
			this.badgesForm.controls.badges.push(typedFormGroup().addControl('badge', badge));
		} else {
			this.selectedBadges.splice(this.selectedBadges.indexOf(badge), 1);
			this.badgesForm.controls.badges.removeAt(
				this.badgesForm.controls.badges.value.findIndex((badge) => badge.badge === badge),
			);
		}
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
	}

	async loadBadges() {
			this.badges = [];
			this.badgeResults = [];
			return new Promise(async (resolve, reject) => {
				this.badgeClassService.badgesByIssuerUrl$.subscribe(
					(badges) => {
						Object.values(badges).forEach((badgeList) => {
							this.badges.push(
								...badgeList
									.slice()
									.filter(
										(b) =>
											b.extension['extensions:StudyLoadExtension'].StudyLoad > 0 &&
											b.extension['extensions:CategoryExtension'].Category !== 'learningpath',
									)
									.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
							);
							this.badgesFormArray = this.badgesForm.controls.badges.value;
							this.tags = sortUnique(this.tags);
							this.issuers = sortUnique(this.issuers);
							this.updateResults();
						});
	
						this.badgeResults = this.badges;
						this.badgeResults.forEach((badge) => {
							this.badgesFormArray.push({ badge: badge, order: 0, selected: false });
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

	onSubmit(formState: CreateBadgeCollectionForm<string>) {
		if (!this.badgeCollectionForm.markTreeDirtyAndValidate()) {
			return;
		}

		const collectionForCreation: ApiRecipientBadgeCollectionForCreation = {
			name: formState.collectionName,
			description: formState.collectionDescription,
			published: false,
			badges: [],
		};

		this.createCollectionPromise = this.recipientBadgeCollectionManager
			.createRecipientBadgeCollection(collectionForCreation)
			.then(
				(collection) => {
					this.router.navigate(['/recipient/badge-collections/collection', collection.slug]);
					this.messageService.reportMinorSuccess('Collection created successfully.');
				},
				(error) => {
					this.messageService.reportHandledError('Unable to create collection', error);
				},
			)
			.then(() => (this.createCollectionPromise = null));
	}
}

interface CreateBadgeCollectionForm<T> {
	collectionName: T;
	collectionDescription: T;
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

