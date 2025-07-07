import { AfterViewInit, Component, computed, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormsModule } from '@angular/forms';
import { appearAnimation } from '../../../common/animations/animations';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { CountUpModule } from 'ngx-countup';
import { NgIf, NgFor } from '@angular/common';
import { BadgeLegendComponent } from '../../../common/components/badge-legend/badge-legend.component';
import { HlmInputDirective } from '../../../components/spartan/ui-input-helm/src/lib/hlm-input.directive';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';
import { OebGlobalSortSelectComponent } from '../../../components/oeb-global-sort-select.component';
import { OebSelectComponent } from '../../../components/select.component';
import { SortPipe } from '../../../common/pipes/sortPipe';
import { BgBadgecard } from '../../../common/components/bg-badgecard';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, filter, map, startWith, Subscription, switchMap } from 'rxjs';
import { CatalogService } from '~/catalog/catalog.service';
import { BadgeClassV3 } from '~/issuer/models/badgeclassv3.model';
import { LoadingDotsComponent } from '../../../common/components/loading-dots.component';

@Component({
	selector: 'app-badge-catalog',
	templateUrl: './badge-catalog.component.html',
	styleUrls: ['./badge-catalog.component.css'],
	animations: [appearAnimation],
	imports: [
		FormMessageComponent,
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
		SortPipe,
		TranslatePipe,
		BgBadgecard,
		LoadingDotsComponent,
	],
})
export class BadgeCatalogComponent extends BaseRoutableComponent implements OnInit, AfterViewInit, OnDestroy {
	sortControl = new FormControl('');
	tagsControl = new FormControl();
	intersectionObserver: IntersectionObserver;
	scrollSubscription?: Subscription;
	paginateSubscription?: Subscription;

	@ViewChild('loadMore') loadMore: ElementRef;

	readonly INPUT_DEBOUNCE_TIME = 500;
	readonly BADGES_PER_PAGE = 20;

	/** The tag selected for filtering {@link badges} into {@link filteredBadges}. */
	selectedTags = signal<ITag['value'][]>([]);
	selectedTags$ = toObservable(this.selectedTags);

	/** A search string that is used to filter {@link badges} into {@link filteredBadges}. */
	searchQuery = signal<string>('');
	searchQuery$ = toObservable(this.searchQuery);

	/** A sorting option to sort {@link badges} into {@link filteredBadges}. */
	sortOption = signal<'name_asc' | 'name_desc' | 'date_asc' | 'date_desc'>('date_desc');
	sortOption$ = toObservable(this.sortOption);

	/**
	 * The 0-indexed current page the component sits on, starting at -1 to
	 * initiate the first load when it is set to 0.
	 */
	currentPage = signal<number>(-1);
	currentPage$ = toObservable(this.currentPage);

	/** Determines whether a legend that explains badge categories is shown. */
	showLegend = signal<boolean>(false);

	/**
	 * The badges resulting from a query to the database with the given inputs of
	 * {@link searchQuery}, {@link selectedTags} and {@link sortOption}
	 */
	badgeResults = signal<BadgeClassV3[]>([]);

	/** Whether or not a next page of badge classes can be exists to be loaded. */
	hasNext = signal<boolean>(true);

	/** Unique issuers of all badges. */
	issuers = computed<string[]>(() =>
		this.badgeResults()
			.filter((b) => b.issuerVerified)
			.flatMap((b) => b.issuer)
			.filter((value, index, array) => array.indexOf(value) === index),
	);

	/** Selectable options to filter with. */
	tagsOptions = computed<ITag[]>(() =>
		this.badgeResults()
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
			[toObservable(this.badgeResults), this.translate.onLangChange.pipe(startWith(this.translate.currentLang))],
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

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		protected catalogService: CatalogService,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
	) {
		super(router, route);
		title.setTitle(`Badges - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	ngAfterViewInit(): void {
		this.intersectionObserver = this.setupIntersectionObserver(this.loadMore);
	}

	ngOnInit() {
		super.ngOnInit();

		this.paginateSubscription = combineLatest(
			[
				this.currentPage$,
				this.searchQuery$.pipe(debounceTime(this.INPUT_DEBOUNCE_TIME)),
				this.selectedTags$,
				this.sortOption$,
			],
			(v1, v2, v3, v4) => ({
				page: v1,
				searchQuery: v2,
				tags: v3,
				sortOption: v4,
			}),
		)
			.pipe(
				filter((i) => i.page >= 0),
				switchMap((i) => this.loadRangeOfBadges(i.page, i.searchQuery, i.tags, i.sortOption)),
			)
			.subscribe((paginatedBadges) => {
				if (!paginatedBadges.next) this.hasNext.set(false);
				if (!paginatedBadges.previous)
					// on the first page, set the whole array to make sure to not append anything
					this.badgeResults.set(paginatedBadges.results);
				else this.badgeResults.update((currentBadges) => [...currentBadges, ...paginatedBadges.results]);
			});

		// Scroll to the top when something resets
		// the list of badges (e.g. due to filtering)
		this.scrollSubscription = this.currentPage$.subscribe((p) => {
			if (p === 0) window?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
		});

		this.tagsControl.valueChanges.subscribe((value) => {
			this.selectedTags.set(value ?? []);
			if (this.currentPage() > 0) this.currentPage.set(0);
		});

		this.sortControl.valueChanges.subscribe((value: 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc') => {
			this.sortOption.set(value);
			if (this.currentPage() > 0) this.currentPage.set(0);
		});
	}

	ngOnDestroy(): void {
		if (this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
	}

	openLegend() {
		this.showLegend.set(true);
	}

	closeLegend() {
		this.showLegend.set(false);
	}

	onSearchQueryChange(query: string) {
		this.searchQuery.set(query);
		this.currentPage.set(0);
	}

	/**
	 * TrackByFunction to uniquely identify a BadgeClass
	 * @param index The index of the badgeclass within the iterable
	 * @param item The BadgeClass itself
	 * @returns The badge classes slug which uniquely identifies the badgeclass
	 */
	trackById(index: number, item: BadgeClassV3) {
		return item.slug;
	}

	removeTag(tag) {
		// remove on the control, triggering an update of the setter
		// and thus updating all dependent signals
		this.tagsControl.setValue(this.tagsControl.value.filter((t) => t != tag));
	}

	private setupIntersectionObserver(element: ElementRef): IntersectionObserver {
		const observer = new IntersectionObserver((entries) => {
			if (entries.at(0).isIntersecting) {
				this.currentPage.update((p) => p + 1);
			}
		});

		observer.observe(element.nativeElement);
		return observer;
	}

	private async loadRangeOfBadges(
		pageNumber: number,
		searchQuery: string,
		selectedTags: string[],
		sortOption: 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc',
	) {
		return await this.catalogService.loadBadges(
			pageNumber * this.BADGES_PER_PAGE,
			this.BADGES_PER_PAGE,
			searchQuery,
			selectedTags,
			sortOption,
		);
	}
}

interface ITag {
	label: string;
	value: string;
}
