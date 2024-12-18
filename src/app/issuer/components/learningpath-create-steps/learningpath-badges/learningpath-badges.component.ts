import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { typedFormGroup } from '../../../../common/util/typed-forms';
import { ValidationErrors, Validators } from '@angular/forms';
import { BadgeClass } from '../../../../issuer/models/badgeclass.model';
import { BadgeClassCategory } from '../../../../issuer/models/badgeclass-api.model';
import { BadgeClassManager } from '../../../../issuer/services/badgeclass-manager.service';
import { sortUnique } from '../../../../catalog/components/badge-catalog/badge-catalog.component';
import { MessageService } from '../../../../common/services/message.service';
import { StringMatchingUtil } from '../../../../common/util/string-matching-util';
import { ApiLearningPath } from '../../../../common/model/learningpath-api.model';



type BadgeResult = BadgeClass & { selected?: boolean };

@Component({
	selector: 'learningpath-badges',
	templateUrl: './learningpath-badges.component.html',
	styleUrls: ['../../learningpath-edit-form/learningpath-edit-form.component.scss']
})
export class LearningPathBadgesComponent implements OnInit {
	@Output() selectedBadgesChanged = new EventEmitter<{ urls: string[], studyLoad: number }>();

	@Input()
	set learningPath (lp: ApiLearningPath) {
		this.initFormFromExisting(lp);
	}
	
	constructor(
		private translate: TranslateService,
		protected badgeClassService: BadgeClassManager,
		protected messageService: MessageService,
	) {
		this.badgesLoaded = this.loadBadges();
	}

	badgesLoaded: Promise<unknown>;
	loadingPromise: Promise<unknown>;
	allBadgesLoaded: boolean = false;
	badges: BadgeClass[] = null;
	badgeResults: BadgeResult[] = null;
	selectedBadgeUrls: string[] = [];
	badgesFormArray: any;

	badgeResultsByIssuer: MatchingBadgeIssuer[] = [];
	badgeResultsByCategory: MatchingBadgeCategory[] = [];
	issuers: string[] = [];
	tags: string[] = [];
	selectedTag: string = null;
	order = 'asc';
	studyLoad = 0;
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

	initFormFromExisting(lp: ApiLearningPath) {
		if (!lp) return;
		lp.badges.forEach((b) => {
			this.selectedBadgeUrls.push(b.badge.json.id);
			this.lpBadgesForm.controls.badges.push(
				typedFormGroup().addControl('badgeUrl', b.badge.json.id)
			)
			this.studyLoad += b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad
		})
		this.selectedBadgesChanged.emit({
			urls: this.selectedBadgeUrls,
			studyLoad: this.studyLoad
		});
	}

	badgeChecked(badgeUrl: string) {
		return this.selectedBadgeUrls.includes(badgeUrl);
	}

	checkboxChange(event, badgeUrl: string, studyLoad: number) {
		if (event) {
			this.selectedBadgeUrls.push(badgeUrl);
			this.lpBadgesForm.controls.badges.push(
				typedFormGroup().addControl('badgeUrl', badgeUrl)
			)
			this.studyLoad += studyLoad;
		}
		else {
			this.selectedBadgeUrls.splice(this.selectedBadgeUrls.indexOf(badgeUrl), 1);
			this.lpBadgesForm.controls.badges.removeAt(this.lpBadgesForm.controls.badges.value.findIndex(badge => badge.badgeUrl === badgeUrl))
			this.studyLoad -= studyLoad;
		}
		this.selectedBadgesChanged.emit({
			urls: this.selectedBadgeUrls,
			studyLoad: studyLoad
		});
	}
	groups: string[] = []
	// groups = [this.translate.instant('Badge.category'), this.translate.instant('Badge.issuer'), '---'];
	categoryOptions: { [key in BadgeClassCategory | 'noCategory']: string } = {
		competency: '',
		participation: '',
		noCategory: ''
	};

	// lpBadgesForm = typedFormGroup(this.minSelectedBadges.bind(this)).addArray(
	// 	'badges',
	// 	typedFormGroup()
	// 		.addControl('selected', false)
	// 		.addControl('badge', null, Validators.required)
	// 		.addControl('order', 0, Validators.required),
	// );

	lpBadgesForm = typedFormGroup(this.minSelectedBadges.bind(this)).addArray(
		'badges',
		typedFormGroup()
			.addControl('badgeUrl', '', Validators.required)
	)

	async loadBadges() {
		this.badges = [];
		this.badgeResults = [];
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.badgesByIssuerUrl$.subscribe(
				(badges) => {
					Object.values(badges).forEach(badgeList => {
						this.badges.push(...badgeList.slice().filter((b) => b.extension['extensions:StudyLoadExtension'].StudyLoad > 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
						this.badgesFormArray = this.lpBadgesForm.controls.badges.value;
						this.tags = sortUnique(this.tags);
						this.issuers = sortUnique(this.issuers);
						this.updateResults();
					})

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

	loadAllBadges() {
		this.loadingPromise = this.loadAllPublicBadges()
	}
	async loadAllPublicBadges() {
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.allPublicBadges$.subscribe(
				(badges) => {
					this.badges = badges.slice().filter((b) => b.extension['extensions:StudyLoadExtension'].StudyLoad > 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					this.badgeResults = this.badges;

					this.badgesFormArray = this.lpBadgesForm.controls.badges.value;
					badges.forEach((badge) => {
						this.badgesFormArray.push({ badge: badge, order: 0, selected: false });
						this.tags = this.tags.concat(badge.tags);
						this.issuers = this.issuers.concat(badge.issuer);
					});

					this.tags = sortUnique(this.tags);
					this.issuers = sortUnique(this.issuers);
					this.updateResults();
					this.allBadgesLoaded = true;
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

	changeOrder(order) {
		this.order = order;
		if (this.order === 'asc') {
			this.badgeResults.sort((a, b) => a.name.localeCompare(b.name));
			this.badgeResultsByIssuer
				.sort((a, b) => a.issuerName.localeCompare(b.issuerName))
				.forEach((r) => r.badges.sort((a, b) => a.name.localeCompare(b.name)));
			this.badgeResultsByCategory
				.sort((a, b) => a.category.localeCompare(b.category))
				.forEach((r) => r.badges.sort((a, b) => a.name.localeCompare(b.name)));
		} else {
			this.badgeResults.sort((a, b) => b.name.localeCompare(a.name));
			this.badgeResultsByIssuer
				.sort((a, b) => b.issuerName.localeCompare(a.issuerName))
				.forEach((r) => r.badges.sort((a, b) => b.name.localeCompare(a.name)));
			this.badgeResultsByCategory
				.sort((a, b) => b.category.localeCompare(a.category))
				.forEach((r) => r.badges.sort((a, b) => b.name.localeCompare(a.name)));
		}
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

	minSelectedBadges(): ValidationErrors | null {
		return this.selectedBadgeUrls.length >= 3
			? null
			: { minSelectedBadges: { required: 3, actual: this.selectedBadgeUrls.length } }
	}
	ngOnInit(): void {
		this.groups[0] = "---"

		this.translate.get('Badge.category').subscribe((translatedText: string) => {
			this.groups[1] = translatedText
		})

		this.translate.get('Badge.issuer').subscribe((translatedText: string) => {
			this.groups[2] = translatedText
		})

		this.translate.get('Badge.competency').subscribe((translatedText: string) => {
			this.categoryOptions.competency = translatedText
		})

		this.translate.get('Badge.participation').subscribe((translatedText: string) => {
			this.categoryOptions.participation = translatedText
		})

		this.translate.get('Badge.noCategory').subscribe((translatedText: string) => {
			this.categoryOptions.noCategory = translatedText
		})
	}
}

class MatchingBadgeIssuer {
	constructor(
		public issuerName: string,
		public badge,
		public badges: BadgeClass[] = [],

	) { }
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
	) { }
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

