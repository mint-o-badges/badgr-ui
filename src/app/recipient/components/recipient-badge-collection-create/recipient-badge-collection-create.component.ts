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
import { RecipientBadgeApiService } from '../../services/recipient-badges-api.service';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { RecipientBadgeInstance } from '../../models/recipient-badge.model';
import { ApiRecipientBadgeIssuer } from '../../models/recipient-badge-api.model';
import { groupIntoArray, groupIntoObject } from '../../../common/util/array-reducers';
import { BadgeInstanceUrl } from '../../../issuer/models/badgeinstance-api.model';


type BadgeSortBy = 'name' | 'newest-first' | 'oldest-first';

@Component({
	selector: 'create-recipient-badge-collection',
	templateUrl: './recipient-badge-collection-create.component.html',
	standalone: false,
})
export class RecipientBadgeCollectionCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	badgeCollectionForm = typedFormGroup()
		.addControl('collectionName', '', [Validators.required, Validators.maxLength(128)])
		.addControl('collectionDescription', '', [Validators.required, Validators.maxLength(255)]);
		
	createCollectionPromise: Promise<unknown>;
	badgesLoaded: Promise<unknown>;

	private omittedCollection: RecipientBadgeInstance[];

	badges: BadgeClass[] = null;
	selectedBadgeUrls: string[] = [];
	selectedBadges: RecipientBadgeInstance[] = [];
	badgesFormArray: any;

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

	get badgeSortBy() {
		return this.badgeSortBy;
	}

	set badgeSortBy(badgeSortBy: BadgeSortBy) {
		this.badgeSortBy = badgeSortBy || 'name';
		this.applySorting();
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

	private loadedData = false;
	hasMultipleIssuers = true;
	restrictToIssuerId: string = null;
	maxDisplayedResults = 100;

	badgeResults: BadgeResult[] = [];
	issuerResults: MatchingIssuerBadges[] = [];
	categoryResults: MatchingBadgeCategory[] = [];

	badgeClassesByIssuerId: { [issuerUrl: string]: RecipientBadgeInstance[] };
	allBadges: RecipientBadgeInstance[];
	allIssuers: ApiRecipientBadgeIssuer[];


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
		protected recipientBadgeApiService: RecipientBadgeApiService,
		private translate: TranslateService,	
		private badgeManager: RecipientBadgeManager	
	) {
		super(router, route, loginService);

		title.setTitle(`Create Collection - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		// this.badgesLoaded = this.loadBadges();
		this.updateData()
		// this.translate.get('Badge.category').subscribe((translatedText: string) => {
		// 	this.groups[0] = translatedText;
		// });

		this.translate.get('Badge.issuer').subscribe((translatedText: string) => {
			this.groups[0] = translatedText;
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	badgeChecked(badge: RecipientBadgeInstance) {
		return this.selectedBadges.includes(badge);
	}

	checkboxChange(event, badge: RecipientBadgeInstance) {
		if (event) {
			this.selectedBadges.push(badge);
		} else {
			this.selectedBadges.splice(this.selectedBadges.indexOf(badge), 1);
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

	private updateBadges(allBadges: RecipientBadgeInstance[]) {
		this.loadedData = true;

		this.badgeClassesByIssuerId = allBadges.reduce(
			groupIntoObject<RecipientBadgeInstance>((b) => b.issuerId),
			{},
		);

		this.allIssuers = allBadges
			.reduce(
				groupIntoArray<RecipientBadgeInstance, string>((b) => b.issuerId),
				[],
			)
			.map((g) => g.values[0].badgeClass.issuer);

		this.allBadges = allBadges.filter((badge) => badge.apiModel.extensions['extensions:CategoryExtension'].Category !== 'learningpath' );
		
		this.hasMultipleIssuers = !this.restrictToIssuerId && new Set(allBadges.map((b) => b.issuerId)).size > 1;

		this.updateResults();
	}	
	private updateData() {
		this.badgesLoaded = this.badgeManager.recipientBadgeList.loadedPromise.then(
			(list) => this.updateBadges(list.entities),
			(err) => this.messageService.reportAndThrowError('Failed to load badge list', err),
		);
	}	

	applySorting() {
		// const badgeSorter = (a: RecipientBadgeInstance, b: RecipientBadgeInstance) => {
		// 	if (this.badgeSortBy === 'name') {
		// 		const aName = a.badgeClass.name.toLowerCase();
		// 		const bName = b.badgeClass.name.toLowerCase();

		// 		return aName === bName ? 0 : aName < bName ? -1 : 1;
		// 	} else if (this.badgeSortBy === 'newest-first') {
		// 		return b.issueDate.getTime() - a.issueDate.getTime();
		// 	} else if (this.badgeSortBy === 'oldest-first') {
		// 		return a.issueDate.getTime() - b.issueDate.getTime();
		// 	}
		// };

		// (this.badgeResults || []).sort((a, b) => badgeSorter(a.badge, b.badge));
		// (this.issuerResults || []).forEach((i) => i.badges.sort(badgeSorter));
	}

	private updateResults() {
			// Clear Results
			this.badgeResults.length = 0;
			this.issuerResults.length = 0;
			this.categoryResults.length = 0;
	
			const issuerResultsByIssuer: { [issuerUrl: string]: MatchingIssuerBadges } = {};
			const addedBadgeUrls = new Set<BadgeInstanceUrl>();
	
			const addBadgeToResults = (badge: RecipientBadgeInstance) => {
				if (addedBadgeUrls.has(badge.url)) {
					return;
				} else {
					addedBadgeUrls.add(badge.url);
				}
	
				// Restrict Length
				if (this.badgeResults.length > this.maxDisplayedResults) {
					return false;
				}
	
				// Restrict to issuer
				if (this.restrictToIssuerId && badge.issuerId !== this.restrictToIssuerId) {
					return false;
				}
	
				let issuerResults = issuerResultsByIssuer[badge.issuerId];
				if (!issuerResults) {
					issuerResults = issuerResultsByIssuer[badge.issuerId] = new MatchingIssuerBadges(
						badge.issuerId,
						badge.badgeClass.issuer,
					);
					this.issuerResults.push(issuerResults);
				}

				// TODO: do this server side maybe?
				// exclude pending badges
				if (badge.mostRelevantStatus !== 'pending') issuerResults.addBadge(badge);

				if (!this.badgeResults.find((r) => r.badge === badge)) {
					if(badge.apiModel.extensions['extensions:CategoryExtension'].Category !== 'learningpath'){
						this.badgeResults.push(new BadgeResult(badge, issuerResults.issuer, false));
					}
				}
	
				return true;
			};
	
			const addIssuerToResults = (issuer: ApiRecipientBadgeIssuer) => {
				(this.badgeClassesByIssuerId[issuer.id] || []).forEach(addBadgeToResults);
			};
	
			this.allIssuers.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery)).forEach(addIssuerToResults);
	
			this.allBadges.filter(MatchingAlgorithm.badgeMatcher(this.searchQuery)).forEach((item) => {
				addBadgeToResults(item)
			});
	
			this.applySorting();
		}

	// private updateResults() {
	// 	let that = this;
	// 	// Clear Results
	// 	this.badgeResults = [];
	// 	this.badgeResultsByIssuer = [];
	// 	const badgeResultsByIssuerLocal = {};
	// 	this.badgeResultsByCategory = [];
	// 	const badgeResultsByCategoryLocal = {};
	// 	var addBadgeToResultsByIssuer = function (item) {
	// 		let issuerResults = badgeResultsByIssuerLocal[item.issuerName];
	// 		if (!issuerResults) {
	// 			issuerResults = badgeResultsByIssuerLocal[item.issuerName] = new MatchingBadgeIssuer(
	// 				item.issuerName,
	// 				'',
	// 			);
	// 			// append result to the issuerResults array bound to the view template.
	// 			that.badgeResultsByIssuer.push(issuerResults);
	// 		}
	// 		issuerResults.addBadge(item);
	// 		return true;
	// 	};
	// 	var addBadgeToResultsByCategory = function (item) {
	// 		let itemCategory =
	// 			item.extension && item.extension['extensions:CategoryExtension']
	// 				? item.extension['extensions:CategoryExtension'].Category
	// 				: 'noCategory';
	// 		let categoryResults = badgeResultsByCategoryLocal[itemCategory];
	// 		if (!categoryResults) {
	// 			categoryResults = badgeResultsByCategoryLocal[itemCategory] = new MatchingBadgeCategory(
	// 				itemCategory,
	// 				'',
	// 			);
	// 			// append result to the categoryResults array bound to the view template.
	// 			that.badgeResultsByCategory.push(categoryResults);
	// 		}
	// 		categoryResults.addBadge(item);
	// 		return true;
	// 	};
	// 	this.badges
	// 		.filter(this.badgeMatcher(this.searchQuery))
	// 		.filter(this.badgeTagMatcher(this.selectedTag))
	// 		.filter((i) => !i.apiModel.source_url)
	// 		.forEach((item) => {
	// 			that.badgeResults.push(item);
	// 			addBadgeToResultsByIssuer(item);
	// 			addBadgeToResultsByCategory(item);
	// 		});
	// }
	

	// async loadBadges() {
	// 		this.badges = [];
	// 		this.badgeResults = [];
	// 		return new Promise(async (resolve, reject) => {
	// 			this.badgeClassService.badgesByIssuerUrl$.subscribe(
	// 				(badges) => {
	// 					Object.values(badges).forEach((badgeList) => {
	// 						this.badges.push(
	// 							...badgeList
	// 								.slice()
	// 								.filter(
	// 									(b) =>
	// 										b.extension['extensions:StudyLoadExtension'].StudyLoad > 0 &&
	// 										b.extension['extensions:CategoryExtension'].Category !== 'learningpath',
	// 								)
	// 								.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
	// 						);
	// 						this.badgesFormArray = this.badgesForm.controls.badges.value;
	// 						this.tags = sortUnique(this.tags);
	// 						this.issuers = sortUnique(this.issuers);
	// 						this.updateResults();
	// 					});
	
	// 					this.badgeResults = this.badges;
	// 					this.badgeResults.forEach((badge) => {
	// 						this.badgesFormArray.push({ badge: badge, order: 0, selected: false });
	// 						this.tags = this.tags.concat(badge.tags);
	// 						this.issuers = this.issuers.concat(badge.issuer);
	// 					});
	// 					this.tags = sortUnique(this.tags);
	// 					this.issuers = sortUnique(this.issuers);
	// 					this.updateResults();
	// 					resolve(badges);
	// 				},
	// 				(error) => {
	// 					this.messageService.reportAndThrowError('Failed to load badges', error);
	// 				},
	// 			);
	// 		});
	// 	}

	onSubmit(formState: CreateBadgeCollectionForm<string>) {
		if (!this.badgeCollectionForm.markTreeDirtyAndValidate()) {
			return;
		}

		console.log("selectedBadges", this.selectedBadges)

		const collectionForCreation: ApiRecipientBadgeCollectionForCreation = {
			name: formState.collectionName,
			description: formState.collectionDescription,
			published: false,
			badges: [],
		};


				this.selectedBadges.forEach((badge) => badge.markAccepted());

		this.createCollectionPromise = this.recipientBadgeCollectionManager
			.createRecipientBadgeCollection(collectionForCreation)
			.then(
				(collection) => {
					collection.updateBadges(this.selectedBadges)
					collection.save().then(
						(success) => 
							{

								this.router.navigate(['/recipient/badge-collections/collection', collection.slug]);
								this.messageService.reportMinorSuccess('Collection created successfully.');
							},
							(failure) => 
								this.messageService.reportHandledError('Unable to create collection', failure)
					)
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

class BadgeResult {
	constructor(
		public badge: RecipientBadgeInstance,
		public issuer: ApiRecipientBadgeIssuer,
		public selected: boolean
	) {}
}

class MatchingIssuerBadges {
	constructor(
		public issuerId: string,
		public issuer: ApiRecipientBadgeIssuer,
		public badges: RecipientBadgeInstance[] = [],
	) {}

	addBadge(badge: RecipientBadgeInstance) {
		if (badge.issuerId === this.issuerId &&
			 badge.apiModel.extensions['extensions:CategoryExtension'].Category !== "learningpath") {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}



class MatchingAlgorithm {
	static issuerMatcher(inputPattern: string): (issuer: ApiRecipientBadgeIssuer) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (issuer) => StringMatchingUtil.stringMatches(issuer.name, patternStr, patternExp);
	}

	static badgeMatcher(inputPattern: string): (badge: RecipientBadgeInstance) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => StringMatchingUtil.stringMatches(badge.badgeClass.name, patternStr, patternExp);
	}
}


