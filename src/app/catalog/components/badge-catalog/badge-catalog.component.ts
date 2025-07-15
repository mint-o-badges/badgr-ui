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
import {
	combineLatest,
	concatMap,
	debounceTime,
	distinctUntilChanged,
	filter,
	map,
	startWith,
	Subscription,
	switchMap,
	tap,
} from 'rxjs';
import { CatalogService } from '~/catalog/catalog.service';
import { BadgeClassV3 } from '~/issuer/models/badgeclassv3.model';
import { LoadingDotsComponent } from '../../../common/components/loading-dots.component';
import { OebButtonComponent } from '~/components/oeb-button.component';
import { BgAwaitPromises } from '~/common/directives/bg-await-promises';
import { skip } from 'rxjs';
import { firstValueFrom } from 'rxjs';

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
		OebButtonComponent,
		BgAwaitPromises,
	],
})
export class BadgeCatalogComponent extends BaseRoutableComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('loadMore') loadMore: ElementRef | undefined;

	readonly INPUT_DEBOUNCE_TIME = 400;
	readonly BADGES_PER_PAGE = 21; // We show at most 3 columns of badges, so we load 7 rows at a time

	/** The tag selected for filtering {@link badges}. */
	selectedTags = signal<ITag['value'][]>([]);
	selectedTags$ = toObservable(this.selectedTags);

	/** A search string that is used to filter {@link badges}. */
	searchQuery = signal<string>('');
	searchQuery$ = toObservable(this.searchQuery);

	/** A sorting option to sort {@link badges}. */
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
	badges = signal<BadgeClassV3[]>([]);

	/** Whether or not a next page of badge classes can be exists to be loaded. */
	hasNext = signal<boolean>(true);

	/**
	 * A signal controlling whether user scrolling should be observed or not.
	 * While new badges are loaded, user scrolling is usually disregarded
	 * and thus should be ignored.
	 **/
	observeScrolling = signal<boolean>(false);
	observeScrolling$ = toObservable(this.observeScrolling);

	/** Unique issuers of all badges. */
	issuers = computed<string[]>(() =>
		this.badges()
			.filter((b) => b.issuerVerified)
			.flatMap((b) => b.issuer)
			.filter((value, index, array) => array.indexOf(value) === index),
	);

	/** Selectable options to filter with. */
	tagsOptions = signal<ITag[]>([]);
	tagsOptions$ = toObservable(this.tagsOptions);

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

	sortControl = new FormControl('');
	tagsControl = new FormControl();
	intersectionObserver: IntersectionObserver | undefined;
	pageSubscriptions: Subscription[] = [];
	pageReadyPromise: Promise<unknown> = firstValueFrom(this.tagsOptions$.pipe(skip(1))); // skip initial value of signal
	viewInitialized: boolean = false;

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

	ngOnInit() {
		super.ngOnInit();

		this.pageSubscriptions.push(
			this.observeScrolling$.pipe(filter((_) => this.intersectionObserver !== undefined)).subscribe((observe) => {
				if (observe) this.intersectionObserver!.observe(this.loadMore!.nativeElement);
				else this.intersectionObserver!.unobserve(this.loadMore!.nativeElement);
			}),
		);

		this.pageSubscriptions.push(
			combineLatest(
				[this.currentPage$, this.searchQuery$, this.selectedTags$, this.sortOption$],
				(v1, v2, v3, v4) => ({
					page: v1,
					searchQuery: v2,
					tags: v3,
					sortOption: v4,
				}),
			)
				.pipe(
					debounceTime(this.INPUT_DEBOUNCE_TIME),
					filter((i) => i.page >= 0),
					distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
					tap((_) => this.observeScrolling.set(false)),
					concatMap((i) => this.loadRangeOfBadges(i.page, i.searchQuery, i.tags, i.sortOption)),
				)
				.subscribe((paginatedBadges) => {
					this.hasNext.set(paginatedBadges?.next !== null);
					if (!paginatedBadges?.previous)
						// on the first page, set the whole array to make sure to not append anything
						this.badges.set(paginatedBadges?.results ?? []);
					else this.badges.update((currentBadges) => [...currentBadges, ...paginatedBadges.results]);
					this.observeScrolling.set(true);
				}),
		);

		// Scroll to the top when something resets
		// the list of badges (e.g. due to filtering)
		this.pageSubscriptions.push(
			this.currentPage$.subscribe((p) => {
				if (p === 0) window?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
			}),
		);

		this.pageSubscriptions.push(
			this.tagsControl.valueChanges.subscribe((value) => {
				this.selectedTags.set(value ?? []);
				if (this.currentPage() > 0) this.currentPage.set(0);
			}),
		);

		this.pageSubscriptions.push(
			this.sortControl.valueChanges.subscribe((value: 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc') => {
				this.sortOption.set(value);
				if (this.currentPage() > 0) this.currentPage.set(0);
			}),
		);

		// Activate the intersection observer once the tags options have been set
		this.pageSubscriptions.push(
			this.tagsOptions$
				.pipe(
					skip(1),
					tap((x) => console.log(x)),
				)
				.subscribe(() => {
					this.observeScrolling.set(true);
				}),
		);

		// load the tags, kicking off the page load process
		this.fetchAvailableTags();
	}

	ngAfterViewInit(): void {
		this.intersectionObserver = this.setupIntersectionObserver(this.loadMore);
	}

	ngOnDestroy(): void {
		for (const s of this.pageSubscriptions) s.unsubscribe();
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

	onLoadMoreClicked() {
		if (this.hasNext()) this.currentPage.update((p) => p + 1);
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

	private fetchAvailableTags(): Promise<ITag[]> {
		return this.catalogService.getBadgeTags().then((t) => {
			const tags: ITag[] = t.map((o) => ({ label: o, value: o }));
			this.tagsOptions.set(tags);
			return tags;
		});
	}

	private setupIntersectionObserver(element: ElementRef): IntersectionObserver {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.at(0)?.isIntersecting && this.hasNext() && this.observeScrolling()) {
					this.currentPage.update((p) => p + 1);
				}
			},
			{ rootMargin: '20% 0px' },
		);
		return observer;
	}

	private async loadRangeOfBadges(
		pageNumber: number,
		searchQuery: string,
		selectedTags: string[],
		sortOption: 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc',
	) {
		return await this.catalogService.getBadges(
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
