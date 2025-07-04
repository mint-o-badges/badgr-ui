import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormsModule } from '@angular/forms';
import { appearAnimation } from '../../../common/animations/animations';
import { applySorting } from '../../util/sorting';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { CountUpModule } from 'ngx-countup';
import { NgIf, NgFor } from '@angular/common';
import { BadgeLegendComponent } from '../../../common/components/badge-legend/badge-legend.component';
import { HlmInputDirective } from '../../../components/spartan/ui-input-helm/src/lib/hlm-input.directive';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';
import { OebGlobalSortSelectComponent } from '../../../components/oeb-global-sort-select.component';
import { OebSelectComponent } from '../../../components/select.component';
import { PaginationAdvancedComponent } from '../../../components/oeb-numbered-pagination';
import { SortPipe } from '../../../common/pipes/sortPipe';
import { BgBadgecard } from '../../../common/components/bg-badgecard';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, startWith, switchMap } from 'rxjs';

@Component({
	selector: 'app-badge-catalog',
	templateUrl: './badge-catalog.component.html',
	styleUrls: ['./badge-catalog.component.css'],
	animations: [appearAnimation],
	imports: [
		FormMessageComponent,
		BgAwaitPromises,
		HlmH1Directive,
		CountUpModule,
		NgIf,
		BadgeLegendComponent,
		FormsModule,
		HlmInputDirective,
		NgIcon,
		HlmIconDirective,
		OebGlobalSortSelectComponent,
		OebSelectComponent,
		NgFor,
		PaginationAdvancedComponent,
		SortPipe,
		TranslatePipe,
		BgBadgecard,
	],
})
export class BadgeCatalogComponent extends BaseRoutableComponent implements OnInit {
	/** Holds all badges known to the component. */
	badges = signal<BadgeClass[]>([]);

	/** The tag selected for filtering {@link badges} into {@link filteredBadges}. */
	selectedTags = signal<ITag['value'][] | null>(null);

	/** A search string that is used to filter {@link badges} into {@link filteredBadges}. */
	searchQuery = signal<string>('');

	/** A sorting option to sort {@link badges} into {@link filteredBadges}. */
	sortOption = signal<string | null>(null);

	/** The 1-indexed current page the component sits on. */
	currentPage = signal<number>(1);

	/** The number of badges shown per page. */
	badgesPerPage = signal<number>(3);

	/** Determines whether a legend that explains badge categories is shown. */
	showLegend = signal<boolean>(false);

	/**
	 * A subset of {@link badges} filtered using the values of {@link searchQuery}, {@link sortOption} and {@link selectedTags}.
	 * When no filters are set, this is equivalent to {@link badges}.
	 */
	filteredBadges = computed<BadgeClass[]>(() =>
		this.filterBadges(this.badges(), this.searchQuery(), this.sortOption(), this.selectedTags()),
	);

	/** The total number of pages taking into account the number of badges per page. */
	totalPages = computed<number>(() => Math.max(1, Math.ceil(this.filteredBadges().length / this.badgesPerPage())));

	/** The subset of {@link filteredBadges} for the currently displayed page. */
	badgeResults = computed<BadgeClass[]>(() =>
		this.filteredBadges().slice(
			(this.currentPage() - 1) * this.badgesPerPage(),
			(this.currentPage() - 1) * this.badgesPerPage() + this.badgesPerPage(),
		),
	);

	/** Unique issuers of all badges. */
	issuers = computed<string[]>(() =>
		this.badges()
			.filter((b) => b.issuerVerified)
			.flatMap((b) => b.issuer)
			.filter((value, index, array) => array.indexOf(value) === index),
	);

	/** Selectable options to filter with. */
	tagsOptions = computed<ITag[]>(() =>
		this.badges()
			.flatMap((b) => b.tags)
			.filter((value, index, array) => array.indexOf(value) === index)
			.sort()
			.map((t) => ({
				label: t,
				value: t,
			})),
	);

	/** A string used for displaying the amount of badges that is aware of the current language. */
	badgesPluralWord = toSignal(
		combineLatest(
			[toObservable(this.badges), this.translate.onLangChange.pipe(startWith(this.translate.currentLang))],
			(badges, lang) => badges,
		).pipe(
			map((badges) => {
				if (badges.length === 0) return 'Badge.noBadges';
				if (badges.length === 1) return 'Badge.oneBadge';
				return 'Badge.multiBadges';
			}),
			switchMap((key) => this.translate.get(key)),
		),
	);

	/** A string used for displaying the amount of issuers that is aware of the current language. */
	issuersPluralWord = toSignal(
		combineLatest(
			[toObservable(this.issuers), this.translate.onLangChange.pipe(startWith(this.translate.currentLang))],
			(issuers, lang) => issuers,
		).pipe(
			map((issuers) => {
				if (issuers.length === 0) return 'Badge.noIssuers';
				if (issuers.length === 1) return 'Badge.oneIssuer';
				return 'Badge.multiIssuers';
			}),
			switchMap((key) => this.translate.get(key)),
		),
	);

	badgesLoaded: Promise<unknown>;
	sortControl = new FormControl('');
	tagsControl = new FormControl();

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
	) {
		super(router, route);
		title.setTitle(`Badges - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		// subscribe to issuer and badge class changes
		this.badgesLoaded = this.loadBadges();
	}

	ngOnInit() {
		super.ngOnInit();

		this.tagsControl.valueChanges.subscribe((value) => {
			this.selectedTags.set(value);
			this.currentPage.set(1);
		});

		this.sortControl.valueChanges.subscribe((value) => {
			this.sortOption.set(value);
			this.currentPage.set(1);
		});
	}

	openLegend() {
		this.showLegend.set(true);
	}

	closeLegend() {
		this.showLegend.set(false);
	}

	onSearchQueryChange(query: string) {
		this.searchQuery.set(query);
		this.currentPage.set(1);
	}

	/**
	 * TrackByFunction to uniquely identify a BadgeClass
	 * @param index The index of the badgeclass within the iterable
	 * @param item The BadgeClass itself
	 * @returns The badge classes slug which uniquely identifies the badgeclass
	 */
	trackById(index: number, item: BadgeClass) {
		return item.slug;
	}

	removeTag(tag) {
		// remove on the control, triggering an update of the setter
		// and thus updating all dependent signals
		this.tagsControl.setValue(this.tagsControl.value.filter((t) => t != tag));
	}

	private async loadBadges() {
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.allPublicBadges$.subscribe(
				async (badges) => {
					this.badges.set(
						badges
							.filter((badge) => badge.issuerVerified && badge.issuerOwnerAcceptedTos)
							.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
					);
					resolve(badges);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load badges', error);
				},
			);
		});
	}

	private filterBadges(
		badges: BadgeClass[],
		query: string,
		sortOption: string | null,
		selectedTags: ITag['value'][] | null,
	) {
		const filtered = badges
			.filter(this.badgeMatcher(query))
			.filter(
				(b) =>
					selectedTags === null ||
					selectedTags.length === 0 ||
					selectedTags.some((tag) => b.tags.includes(tag)),
			)
			.filter((b) => !b.apiModel.source_url);

		if (sortOption !== null) applySorting(filtered, sortOption);
		return filtered;
	}

	private badgeMatcher(inputPattern: string): (badge) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => StringMatchingUtil.stringMatches(badge.name, patternStr, patternExp);
	}
}

interface ITag {
	label: string;
	value: string;
}
