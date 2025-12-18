import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormControl, FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import {
	combineLatest,
	debounceTime,
	distinctUntilChanged,
	filter,
	firstValueFrom,
	skip,
	Subscription,
	switchMap,
	tap,
} from 'rxjs';

import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';

import { CatalogService } from '~/catalog/catalog.service';
import { IssuerV3 } from '~/issuer/models/issuerv3.model';

import { preloadImageURL } from '../../../common/util/file-util';
import { appearAnimation } from '../../../common/animations/animations';

import { FormMessageComponent } from '~/common/components/form-message.component';
import { OebHeaderText } from '~/components/oeb-header-text.component';
import { CountUpModule } from 'ngx-countup';
import { NgIcon } from '@ng-icons/core';
import { OebGlobalSortSelectComponent } from '~/components/oeb-global-sort-select.component';
import { OebSelectComponent } from '~/components/select.component';
import { LoadingDotsComponent } from '~/common/components/loading-dots.component';
import { OebButtonComponent } from '~/components/oeb-button.component';
import { IssuerCardComponent } from '~/components/issuer-card/issuer-card.component';
import { NgClass } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { BgAwaitPromises } from '~/common/directives/bg-await-promises';

@Component({
	selector: 'app-issuer-catalog',
	templateUrl: './issuer-catalog.component.html',
	styleUrls: ['./issuer-catalog.component.css'],
	animations: [appearAnimation],
	imports: [
		TranslatePipe,
		FormMessageComponent,
		OebHeaderText,
		OebGlobalSortSelectComponent,
		OebSelectComponent,
		CountUpModule,
		NgIcon,
		NgClass,
		FormsModule,
		LoadingDotsComponent,
		OebButtonComponent,
		IssuerCardComponent,
		BgAwaitPromises,
	],
})
export class IssuerCatalogComponent extends BaseRoutableComponent implements OnInit, AfterViewInit, OnDestroy {
	// ---------------------------------------------------------------------------
	// Injected services
	// ---------------------------------------------------------------------------
	router = inject(Router);
	route = inject(ActivatedRoute);
	private title = inject(Title);
	private translate = inject(TranslateService);
	private messageService = inject(MessageService);
	private sessionService = inject(SessionService);
	private configService = inject(AppConfigService);
	private profileManager = inject(UserProfileManager);
	private catalogService = inject(CatalogService);

	// ---------------------------------------------------------------------------
	// View
	// ---------------------------------------------------------------------------
	@ViewChild('map') mapContainer!: ElementRef<HTMLElement>;
	mapObject!: Map;

	@ViewChild('loadMore') loadMore: ElementRef | undefined;

	readonly INPUT_DEBOUNCE_TIME = 400;
	readonly ISSUERS_PER_PAGE = 20;

	readonly issuerPlaceholderSrc = preloadImageURL('../../../../breakdown/static/images/placeholderavatar-issuer.svg');

	badgesDisplay: 'grid' | 'map' = 'grid';
	loggedIn = false;

	intersectionObserver?: IntersectionObserver;

	// ---------------------------------------------------------------------------
	// Signals (catalog state)
	// ---------------------------------------------------------------------------
	issuers = signal<IssuerV3[]>([]);
	totalCount = signal<number>(0);
	hasNext = signal<boolean>(true);

	currentPage = signal<number>(-1);
	currentPage$ = toObservable(this.currentPage);

	observeScrolling = signal<boolean>(false);
	observeScrolling$ = toObservable(this.observeScrolling);

	searchQuery = signal<string>('');
	searchQuery$ = toObservable(this.searchQuery);

	categoryFilter = signal<string>('');
	categoryFilter$ = toObservable(this.categoryFilter);

	sortOption = signal<'badges_desc' | 'name_asc' | 'name_desc' | 'date_desc'>('badges_desc');
	sortOption$ = toObservable(this.sortOption);

	// ---------------------------------------------------------------------------
	// Controls
	// ---------------------------------------------------------------------------
	categoryControl = new FormControl('');
	sortControl = new FormControl('badges_desc');

	// ---------------------------------------------------------------------------
	// Page readiness (for bgAwaitPromises)
	// ---------------------------------------------------------------------------
	pageReadyPromise: Promise<unknown> = firstValueFrom(toObservable(this.issuers).pipe(skip(1)));

	// ---------------------------------------------------------------------------
	// Subscriptions
	// ---------------------------------------------------------------------------
	pageSubscriptions: Subscription[] = [];

	categoryOptions = [
		{ label: 'Issuer.categories.schule', value: 'schule' },
		{ label: 'Issuer.categories.hochschule', value: 'hochschule' },
		{ label: 'Issuer.categories.jugendhilfe', value: 'jugendhilfe' },
		{ label: 'Issuer.categories.andere', value: 'andere' },
		{ label: 'Issuer.categories.allCategories', value: '' },
	];

	// ---------------------------------------------------------------------------
	// Lifecycle
	// ---------------------------------------------------------------------------
	constructor() {
		super(inject(Router), inject(ActivatedRoute));
		this.title.setTitle(`Issuers – ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	ngOnInit(): void {
		this.pageSubscriptions.push(
			this.observeScrolling$.pipe(filter(() => this.intersectionObserver !== undefined)).subscribe((observe) => {
				if (observe) this.intersectionObserver!.observe(this.loadMore!.nativeElement);
				else this.intersectionObserver!.unobserve(this.loadMore!.nativeElement);
			}),
		);

		// Main paging stream
		this.pageSubscriptions.push(
			combineLatest([this.currentPage$, this.searchQuery$, this.categoryFilter$, this.sortOption$])
				.pipe(
					debounceTime(this.INPUT_DEBOUNCE_TIME),
					filter(([page]) => page >= 0),
					distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
					filter(() => this.hasNext()),
					tap(() => this.observeScrolling.set(false)),
					switchMap(([page, search, category, sort]) =>
						this.catalogService.getIssuers(
							page * this.ISSUERS_PER_PAGE,
							this.ISSUERS_PER_PAGE,
							search,
							category,
							undefined,
							sort,
						),
					),
				)
				.subscribe((response) => {
					this.totalCount.set(response.count);
					this.hasNext.set(response.next !== null);

					if (!response.previous) {
						this.issuers.set(response.results);
					} else {
						this.issuers.update((curr) => [...curr, ...response.results]);
					}

					this.observeScrolling.set(true);
				}),
		);

		// Reset paging on filter changes
		this.pageSubscriptions.push(
			this.categoryControl.valueChanges.subscribe((v) => {
				this.categoryFilter.set(v || '');
				this.currentPage.set(0);
			}),
		);

		this.pageSubscriptions.push(
			this.sortControl.valueChanges.subscribe((v: any) => {
				this.sortOption.set(v);
				this.currentPage.set(0);
			}),
		);

		// Initial load
		this.currentPage.set(0);
	}

	ngAfterViewInit(): void {
		this.intersectionObserver = this.setupIntersectionObserver(this.loadMore);
	}

	ngOnDestroy(): void {
		this.pageSubscriptions.forEach((s) => s.unsubscribe());
	}

	// ---------------------------------------------------------------------------
	// Data loading
	// ---------------------------------------------------------------------------
	async loadPage(): Promise<void> {
		const page = this.currentPage();
		const offset = page * this.ISSUERS_PER_PAGE;

		const response = await this.catalogService.getIssuers(
			offset,
			this.ISSUERS_PER_PAGE,
			this.searchQuery(),
			this.categoryFilter(),
			undefined,
			this.sortOption(),
		);

		if (!response) return;

		this.totalCount.set(response.count);
		this.hasNext.set(Boolean(response.next));

		if (page === 0) {
			this.issuers.set(response.results);
		} else {
			this.issuers.update((i) => [...i, ...response.results]);
		}

		if (this.badgesDisplay === 'map') {
			this.updateMap(response.results);
		}
	}

	loadNextPage(): void {
		if (!this.hasNext()) return;
		this.currentPage.update((p) => p + 1);
		this.loadPage();
	}

	resetAndReload(): void {
		this.currentPage.set(0);
		this.issuers.set([]);
		this.loadPage();
	}

	// ---------------------------------------------------------------------------
	// Map
	// ---------------------------------------------------------------------------
	initMap(): void {
		this.mapObject = new Map({
			container: this.mapContainer.nativeElement,
			style: {
				version: 8,
				sources: {
					osm: {
						type: 'raster',
						tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
						tileSize: 256,
					},
				},
				layers: [
					{
						id: 'osm',
						type: 'raster',
						source: 'osm',
					},
				],
			},
			center: [10.5, 51],
			zoom: 5,
		});

		this.mapObject.addControl(new NavigationControl());
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

	updateMap(issuers: IssuerV3[]): void {
		// const geojson = {
		// 	type: 'FeatureCollection',
		// 	features: issuers
		// 		.filter((i) => i.lat && i.lon)
		// 		.map((i) => ({
		// 			type: 'Feature',
		// 			geometry: {
		// 				type: 'Point',
		// 				coordinates: [i.lon, i.lat],
		// 			},
		// 			properties: {
		// 				name: i.name,
		// 				slug: i.slug,
		// 				category: i.category,
		// 			},
		// 		})),
		// };
		// const source = this.mapObject.getSource('issuers') as any;
		// if (source) {
		// 	source.setData(geojson);
		// } else {
		// 	this.mapObject.addSource('issuers', {
		// 		type: 'geojson',
		// 		data: geojson,
		// 		cluster: true,
		// 		clusterRadius: 30,
		// 	});
		// }
	}

	// ---------------------------------------------------------------------------
	// UI
	// ---------------------------------------------------------------------------
	openMap(): void {
		this.badgesDisplay = 'map';
		setTimeout(() => this.mapObject.resize(), 50);
	}

	openGrid(): void {
		this.badgesDisplay = 'grid';
	}

	navigateToIssuer(issuer: IssuerV3): void {
		if (!this.loggedIn) {
			this.router.navigate(['/public/issuers/', issuer.slug]);
			return;
		}

		this.profileManager.userProfilePromise.then(() => {
			this.router.navigate(['/issuer/issuers/', issuer.slug]);
		});
	}

	// ---------------------------------------------------------------------------
	// Getters
	// ---------------------------------------------------------------------------
	get theme() {
		return this.configService.theme;
	}

	get issuersPluralWord(): string {
		return this.totalCount() === 1 ? '1 Institution' : this.translate.instant('General.institutions');
	}
}
