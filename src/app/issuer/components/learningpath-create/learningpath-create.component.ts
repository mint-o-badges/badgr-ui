import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../../../common/services/session.service";
import { MessageService } from "../../../common/services/message.service";
import { IssuerApiService } from "../../services/issuer-api.service";
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
import { LearningPath } from "../../models/learningpath.model";
import { BadgeStudioComponent } from "../badge-studio/badge-studio.component";
import { BgFormFieldImageComponent } from "../../../common/components/formfield-image";
import { TranslateService } from '@ngx-translate/core';
import { BadgeInstanceManager } from "../../services/badgeinstance-manager.service";
import { ApiLearningPathForCreation } from "../../../common/model/learningpath-api.model";
import { BadgeClassCategory } from "../../models/badgeclass-api.model";

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
export class LearningPathCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	@ViewChild('badgeStudio')
	badgeStudio: BadgeStudioComponent;
	@ViewChild('imageField')
	imageField: BgFormFieldImageComponent;

	@ViewChild('customImageField')
	customImageField: BgFormFieldImageComponent;

	@Output()
	save = new EventEmitter<Promise<ApiLearningPathForCreation>>();
	
	readonly badgeClassPlaceholderImageUrl = '../../../../breakdown/static/images/placeholderavatar.svg';

	breadcrumbLinkEntries: LinkEntry[] = [];
	badgesLoaded: Promise<unknown>;
	savePromise: Promise<ApiLearningPathForCreation> | null = null;
	badges: BadgeClass[] = null;
	badgeResults: BadgeClass[] = null;
	badgesFormArray: any;
    draggableList: {id: string, name: string, image: any, description: string, slug: string, issuerName: string}[] = [];
	badgeResultsByIssuer: MatchingBadgeIssuer[] = [];
	badgeResultsByCategory: MatchingBadgeCategory[] = [];
	tags: string[] = [];
	issuers: string[] = [];
	selectedTag: string = null;
	order= 'asc';
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
		this._selectedBadges = val;
	}
    constructor(
		protected formBuilder: FormBuilder,
		protected loginService: SessionService,
		protected messageService: MessageService,
		protected learningPathApiService: LearningPathApiService,
		protected issuerApiService: IssuerApiService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected badgeClassService: BadgeClassManager,
		private translate: TranslateService,
		protected badgeInstanceManager: BadgeInstanceManager,	
		// protected title: Title,
	) {
		super(router, route, loginService);
		this.badgesLoaded = this.loadBadges();
    }

	ngOnInit(){
		this.learningPathForm.rawControl.controls.badges.statusChanges.subscribe((value) => {
			this.learningPathForm.value.badges.filter((badge) => badge.selected).forEach((badge) => {
				this.draggableList.push({id: badge.badge.slug, name: badge.badge.name, image: badge.badge.image, description: badge.badge.description, slug: badge.badge.slug, issuerName: badge.badge.issuerName})
		})
		})
	}

	useOurEditor = this.translate.instant('CreateBadge.useOurEditor');
	imageSublabel = this.translate.instant('CreateBadge.imageSublabel');
	useOwnVisual = this.translate.instant('CreateBadge.useOwnVisual');
	uploadOwnVisual = this.translate.instant('CreateBadge.uploadOwnVisual');
	uploadOwnDesign = this.translate.instant('CreateBadge.uploadOwnDesign');

	groups = [this.translate.instant('Badge.category'), this.translate.instant('Badge.issuer'), '---'];
	categoryOptions: { [key in BadgeClassCategory | 'noCategory']: string } = {
		competency: this.translate.instant('Badge.competency'),
		participation: this.translate.instant('Badge.participation'),
		noCategory: this.translate.instant('Badge.noCategory'),
	};

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

    learningPathForm = typedFormGroup()
		.addControl('name', '', [
			Validators.required,
			Validators.maxLength(60)])
		.addControl('description', '', [Validators.required, Validators.maxLength(700)])
		.addControl('badge_image', '')
		.addControl('badge_customImage', '')
		.addArray(
			'badges',
			typedFormGroup()
				.addControl('selected', false)
				.addControl('badge', null, Validators.required)
				.addControl('order', 0, Validators.required),
				// Technically this is only required if selected,
				// but since it doesn't make sense to remove the
				// default of 60 from unselected suggestions,
				// this doesn't really matter
		)
		// .addArray(
		// 	'badges',
		// 	typedFormGroup()
		// 		.addControl('slug', '', Validators.required)
		// 		.addControl('order', 0, Validators.required),
		// )	
	async loadBadges() {
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.allPublicBadges$.subscribe(
				(badges) => {
					this.badges = badges.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					this.badgeResults = this.badges;

					this.badgesFormArray = this.learningPathForm.controls.badges.value;
					
					badges.forEach((badge) => {
						this.badgesFormArray.push({ badge: badge, order: 0, selected: false });
						this.tags = this.tags.concat(badge.tags);
						this.issuers = this.issuers.concat(badge.issuer);
					});
					this.learningPathForm.setValue({
						...this.learningPathForm.value,
						badges: this.badgesFormArray,
					})
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
		// this.changeOrder(this.order);
		// console.log(this.badgeResultsByIssuer)
        // this.draggableList = this.badgeResults.map((item, index) => {
        //     return {
		// 	  id: index,	
        //       content: item,
        //       effectAllowed: 'move',
        //       disable: false,
        //       handle: false
        //     };
        //   });
		// this.badgeResults.forEach((item, index) => {
		// 	this.draggableList.push({id: index.toString(), name: item.name, image: item.image, description: item.description, slug: item.slug, issuerName: item.issuerName})
		// })

	}
        
      onDragged(item: any, list: any[], effect: DropEffect) {
        const index = list.indexOf(item);
        list.splice(index, 1);
      }


	  onDrop(event: DndDropEvent, index: number, list: any[]) {
	
		const previousIndex = list.findIndex((item) => item.id === event.data.id);
	
		if (previousIndex !== -1) {
		  list.splice(previousIndex, 1);
		}
	
		if (typeof index === 'undefined') {
		  index = list.length;
		}
	
		list.splice(index, 0, event.data);
	  }

	cancelClicked() {
		// this.cancel.emit();
	}

	generateRandomImage() {
		this.badgeStudio
			.generateRandom()
			.then((imageUrl) => this.imageField.useDataUrl(imageUrl, 'Auto-generated image'));
	}

	generateUploadImage(image, formdata) {
			this.badgeStudio.generateUploadImage(image.slice(), formdata).then((imageUrl) => {
				this.imageField.useDataUrl(imageUrl, 'BADGE');
			});
	}

	generateCustomUploadImage(image) {
			this.customImageField.useDataUrl(image, 'BADGE');
	}

	async onSubmit() {
		try {

			const formState = this.learningPathForm.value;
			console.log(formState);
	
			const criteriaText = "*Folgende Kriterien sind auf Basis deiner Eingaben als Metadaten im Badge hinterlegt*: \n\n"
			const participationText = `Du hast erfolgreich an **${this.learningPathForm.value.name}** teilgenommen.  \n\n `
	
			const participationBadge = await this.badgeClassService.createBadgeClass(this.issuerSlug, {
				image: formState.badge_customImage,
				name: formState.name,
				description: formState.description,
				tags: [],
				criteria_text: criteriaText,
				criteria_url: ''
			})
	
			const issuer = await this.issuerApiService.getIssuer(this.issuerSlug);
	
			this.savePromise = this.learningPathApiService.createLearningPath(this.issuerSlug, {
				issuer_id: issuer.slug,
				name: formState.name,
				description: formState.description,
				tags: [],
				badges: this.draggableList.map((item, index) => {
					return {
						slug: item.slug,
						order: index,
					};
				}),
				participationBadge_id: participationBadge.slug,
			});
	
			console.log('badge', participationBadge)
			console.log('issuer', issuer)
			console.log('learning path', this.savePromise)
			this.save.emit(this.savePromise);
		}

		catch (e) {
			console.log(e);
		}
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