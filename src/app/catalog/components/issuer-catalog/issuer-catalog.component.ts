import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { Issuer } from '../../../issuer/models/issuer.model';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';

import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { FormControl, FormsModule } from '@angular/forms';
import { appearAnimation } from '../../../common/animations/animations';
import { applySorting } from '../../util/sorting';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { CountUpModule } from 'ngx-countup';
import { HlmInputDirective } from '../../../components/spartan/ui-input-helm/src/lib/hlm-input.directive';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';
import { OebGlobalSortSelectComponent } from '../../../components/oeb-global-sort-select.component';
import { OebSelectComponent } from '../../../components/select.component';
import { NgIf, NgFor, I18nPluralPipe } from '@angular/common';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { IssuerCardComponent } from '../../../components/issuer-card/issuer-card.component';
import { PaginationAdvancedComponent } from '../../../components/oeb-numbered-pagination';

@Component({
    selector: 'app-issuer-catalog',
    templateUrl: './issuer-catalog.component.html',
    styleUrls: ['./issuer-catalog.component.css'],
    animations: [appearAnimation],
    imports: [
        FormMessageComponent,
        HlmH1Directive,
        BgAwaitPromises,
        CountUpModule,
        FormsModule,
        HlmInputDirective,
        NgIcon,
        HlmIconDirective,
        OebGlobalSortSelectComponent,
        OebSelectComponent,
        NgIf,
        OebButtonComponent,
        NgFor,
        IssuerCardComponent,
        PaginationAdvancedComponent,
        I18nPluralPipe,
        TranslatePipe,
    ],
})
export class IssuerCatalogComponent extends BaseRoutableComponent implements OnInit, AfterViewInit {
	readonly issuerPlaceholderSrc = preloadImageURL('../../../../breakdown/static/images/placeholderavatar-issuer.svg');
	readonly noIssuersPlaceholderSrc =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-issuer.svg';

	Array = Array;

	issuers: Issuer[] = null;
	chooseABadgeCategory = this.translate.instant('CreateBadge.chooseABadgeCategory');

	issuersLoaded: Promise<unknown>;
	issuerResults: Issuer[] = [];
	issuerResultsByCategory: MatchingIssuerCategory[] = [];
	filteredIssuers: Issuer[] = [];

	order = 'asc';
	public badgesDisplay = 'grid';

	issuerGeoJson;
	categoryControl = new FormControl('');
	categoryOptions = [
		{
			label: 'Issuer.categories.schule',
			value: 'schule',
		},
		{
			label: 'Issuer.categories.hochschule',
			value: 'hochschule',
		},
		{
			label: 'Issuer.categories.andere',
			value: 'andere',
		},
		{
			label: 'Issuer.categories.allCategories',
			value: '',
		},
	];

	sortControl = new FormControl();
	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		// this.updateResults();
		this.updatePaginatedResults();
		this.currentPage = 1;
	}

	private _categoryFilter = '';
	get categoryFilter() {
		return this._categoryFilter;
	}

	set categoryFilter(val: string) {
		this._categoryFilter = val;
		// this.updateResults();
		this.updatePaginatedResults();
		this.currentPage = 1;
	}

	isFiltered() {
		return Boolean(this.searchQuery || this.categoryFilter);
	}

	private _currentPage = 1;

	get currentPage(): number {
		return this._currentPage;
	}

	set currentPage(value: number) {
		if (this._currentPage !== value) {
			this._currentPage = value;
			this.updatePaginatedResults();
		}
	}

	get theme() {
		return this.configService.theme;
	}
	get features() {
		return this.configService.featuresConfig;
	}

	issuersPerPage = 30;
	totalPages: number;
	nextLink: string;
	previousLink: string;

	sortOption: string | null = null;

	issuerKeys = {};
	plural = {};

	mapObject;
	@ViewChild('map')
	private mapContainer: ElementRef<HTMLElement>;

	public loggedIn = false;

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected configService: AppConfigService,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
		public sessionService: SessionService,
		protected profileManager: UserProfileManager,
	) {
		super(router, route);
		title.setTitle(`Issuers - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		// subscribe to issuer and badge class changes
		this.issuersLoaded = this.loadIssuers();
		// Subscribe to changes on the control
		this.categoryControl.valueChanges.subscribe((value) => {
			this.categoryFilter = value;
		});
	}

	async loadIssuers() {
		let that = this;
		return new Promise(async (resolve, reject) => {
			this.issuerManager.getAllIssuers().subscribe(
				(issuers) => {
					this.issuers = issuers
						.filter((i) => i.apiModel.verified && i.ownerAcceptedTos && !i.apiModel.source_url)
						.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					this.totalPages = Math.ceil(this.issuers.length / this.issuersPerPage);
					this.updatePaginatedResults();
					// this.issuerResults = this.issuers;
					// this.issuerResults.sort((a, b) => a.name.localeCompare(b.name));
					// if (this.mapObject)
					// 	this.mapObject.on('load', function () {
					// 		that.generateGeoJSON(that.issuerResults);
					// 	});
					resolve(issuers);
				},
				(error) => {
					this.messageService.reportAndThrowError(this.translate.instant('Issuer.failLoadissuers'), error);
				},
			);
		});
	}

	ngOnInit() {
		super.ngOnInit();

		this.loggedIn = this.sessionService.isLoggedIn;

		this.prepareTexts();

		// Translate: to update predefined text when language is changed
		this.translate.onLangChange.subscribe((event) => {
			this.prepareTexts();
		});

		this.sortControl.valueChanges.subscribe((value) => {
			this.sortOption = value;
			this.updatePaginatedResults();
		});
	}

	ngAfterViewInit() {
		const myAPIKey = 'pk.eyJ1IjoidW11dDAwIiwiYSI6ImNrdXpoeDh3ODB5NzMydnFxMzI4eTlma3AifQ.SXH5fK6-sTOhrgWxiT10OQ';
		const mapStyle = 'mapbox://styles/mapbox/streets-v11';

		const initialState = { lng: 10.5, lat: 51, zoom: 5 };
		const style: any = {
			version: 8,
			sources: {
				osm: {
					type: 'raster',
					tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
					tileSize: 256,
					attribution: '&copy; OpenStreetMap Contributors',
					maxzoom: 19,
				},
			},
			layers: [
				{
					id: 'osm',
					type: 'raster',
					source: 'osm', // This must match the source key above
				},
			],
			glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
		};
		this.mapObject = new Map({
			container: this.mapContainer.nativeElement,
			style: style,
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom,
		});

		this.mapObject.addControl(new NavigationControl());
		let that = this;
		this.mapObject.on('load', function () {
			// Add an image to use as a custom marker
			that.mapObject.loadImage(
				'https://maplibre.org/maplibre-gl-js-docs/assets/osgeo-logo.png',
				function (error, image) {
					if (error) throw error;
					that.mapObject.addImage('custom-marker', image);
				},
			);
		});
	}

	private updateResults() {
		let that = this;
		// Clear Results
		this.issuerResults = [];
		this.issuerResultsByCategory = [];

		this.issuerResults.sort((a, b) => a.name.localeCompare(b.name));
		this.issuerResults = this.issuers
			.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery))
			.filter((issuer) => !this.categoryFilter || issuer.category === this.categoryFilter);
		this.issuerResultsByCategory.forEach((r) => r.issuers.sort((a, b) => a.name.localeCompare(b.name)));
		this.generateGeoJSON(this.issuerResults);
	}

	private updatePaginatedResults() {
		let that = this;
		// Clear Results
		this.issuerResults = [];
		this.issuerResultsByCategory = [];

		// this.issuerResults.sort((a, b) => a.name.localeCompare(b.name));

		this.filteredIssuers = this.issuers
			.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery))
			.filter((issuer) => !this.categoryFilter || issuer.category === this.categoryFilter);

		if (this.sortOption) {
			applySorting(this.filteredIssuers, this.sortOption);
		}
		this.totalPages = Math.ceil(this.filteredIssuers.length / this.issuersPerPage);
		const start = (this.currentPage - 1) * this.issuersPerPage;
		const end = start + this.issuersPerPage;

		that.issuerResults = this.filteredIssuers.slice(start, end);
		// this.issuerResults = this.issuers
		// 	.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery))
		// 	.filter((issuer) => !this.categoryFilter || issuer.category === this.categoryFilter);
		// this.issuerResultsByCategory.forEach((r) => r.issuers.sort((a, b) => a.name.localeCompare(b.name)));
		// this.generateGeoJSON(this.issuerResults);
	}

	generateGeoJSON(issuers) {
		this.issuerGeoJson = {
			type: 'FeatureCollection',
			features: issuers
				.filter((issuer) => issuer.lat !== null && issuer.lon !== null)
				.map((issuer) => ({
					type: 'Feature',
					properties: {
						name: issuer.name,
						slug: issuer.slug,
						img: issuer.image,
						description: issuer.description,
						category: issuer.category,
					},
					geometry: {
						type: 'Point',
						coordinates: [issuer.lon, issuer.lat],
					},
				})),
		};

		if (!this.mapObject.getSource('issuers')) {
			this.mapObject.addSource('issuers', {
				type: 'geojson',
				data: this.issuerGeoJson,
				cluster: true,
				clusterRadius: 10,
			});
			this.mapObject.addLayer({
				id: 'issuers',
				type: 'circle',
				source: 'issuers',
				filter: ['!', ['has', 'point_count']],
				paint: {
					'circle-radius': {
						base: 4,
						stops: [
							[12, 6],
							[22, 180],
						],
					},
					'circle-color': [
						'match',
						['get', 'category'],
						'schule',
						'#fbb03b',
						'hochschule',
						'#e55e5e',
						'andere',
						'#3bb2d0',
						'n/a',
						'#223b53',
						/* other */ '#ccc',
					],
				},
			});

			this.mapObject.addLayer({
				id: 'issuersCluster',
				type: 'circle',
				source: 'issuers',
				filter: ['has', 'point_count'],
				paint: {
					'circle-radius': {
						base: 10,
						stops: [
							[12, 10],
							[22, 180],
						],
					},
					'circle-color': [
						'match',
						['get', 'category'],
						'schule',
						'#fbb03b',
						'hochschule',
						'#e55e5e',
						'andere',
						'#3bb2d0',
						'n/a',
						'#223b53',
						/* other */ '#ccc',
					],
				},
			});

			this.mapObject.addLayer({
				id: 'cluster-count',
				type: 'symbol',
				source: 'issuers',
				filter: ['has', 'point_count'],
				layout: {
					'text-field': '{point_count_abbreviated}',
					'text-font': ['Open Sans Regular'],
					'text-size': 12,
				},
			});

			this.mapObject.on('click', 'issuers', (e) => {
				// Copy coordinates array.
				const coordinates = e.features[0].geometry.coordinates.slice();
				const name = e.features[0].properties.name;
				const slug = e.features[0].properties.slug;
				const desc = e.features[0].properties.description;
				const img = e.features[0].properties.img;

				// Ensure that if the map is zoomed out such that multiple
				// copies of the feature are visible, the popup appears
				// over the copy being pointed to.
				while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
					coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
				}

				new Popup()
					.setLngLat(coordinates)
					.setHTML(
						'<div style="padding:5px"><a href="public/issuers/' +
							slug +
							'">' +
							name +
							'</a><br><p>' +
							desc +
							'</p></div>',
					)
					.addTo(this.mapObject);
			});

			this.mapObject.on('click', 'issuersCluster', (e) => {
				const coordinates = e.features[0].geometry.coordinates.slice();

				const features = this.mapObject.queryRenderedFeatures(e.point, {
					layers: ['issuersCluster'],
				});

				const clusterId = features[0].properties.cluster_id;
				var pointCount = features[0].properties.point_count;

				var htmlString = '<div style="padding:5px"><ul>';

				this.mapObject.getSource('issuers').getClusterLeaves(clusterId, pointCount, 0, (error, features) => {
					features.forEach((feature) => {
						htmlString +=
							'<li><a href="public/issuers/' +
							feature.properties.slug +
							'"><div class="color ' +
							feature.properties.category +
							'"></div>' +
							feature.properties.name +
							'</li>';
					});
					htmlString += '</ul></div>';

					new Popup().setLngLat(coordinates).setHTML(htmlString).addTo(this.mapObject);
				});
			});

			// Change the cursor to a pointer when the mouse is over the places layer.
			this.mapObject.on('mouseenter', 'issuers', () => {
				this.mapObject.getCanvas().style.cursor = 'pointer';
			});

			// Change it back to a pointer when it leaves.
			this.mapObject.on('mouseleave', 'issuers', () => {
				this.mapObject.getCanvas().style.cursor = '';
			});
		} else {
			this.mapObject.getSource('issuers').setData(this.issuerGeoJson);
		}
	}

	openMap() {
		this.badgesDisplay = 'map';
		this.updateResults();
		let that = this;
		setTimeout(function () {
			that.mapObject.resize();
		}, 10);
	}

	openGrid() {
		this.badgesDisplay = 'grid';
		this.updateResults();
	}

	prepareTexts() {
		this.issuerKeys = {
			schule: 'Schulen',
			hochschule: 'Hochschulen und Universitäten',
			andere: 'Andere (Bibliotheken, Museen, FabLabs, Unternehmen, Vereine, ...)',
			'n/a': 'Keine Angabe',
		};
		this.plural = {
			issuer: {
				'=0': this.translate.instant('Issuer.noInstitutions'),
				'=1': '1 Institution',
				other: '# ' + this.translate.instant('General.institutions'),
			},
			issuerText: {
				'=0': this.translate.instant('Issuer.institutionsIssued'),
				'=1': '1 ' + this.translate.instant('Issuer.institutionIssued'),
				other: '# ' + this.translate.instant('Issuer.institutionsIssued'),
			},
			badges: {
				'=0': this.translate.instant('Issuer.noBadges'),
				'=1': '<strong class="u-text-bold">1</strong> Badge',
				other: '<strong class="u-text-bold">#</strong> Badges',
			},
			learningPath: {
				'=0': this.translate.instant('General.noLearningPaths'),
				'=1': '1 ' + this.translate.instant('General.learningPath'),
				other: '# ' + this.translate.instant('General.learningPaths'),
			},
			recipient: {
				'=0': this.translate.instant('Issuer.noRecipient'),
				'=1': '1 ' + this.translate.instant('Issuer.recipient'),
				other: '# ' + this.translate.instant('Issuer.recipients'),
			},
		};
	}

	navigateToIssuer(issuerData) {
		if (!this.loggedIn) {
			this.router.navigate(['/public/issuers/', issuerData.slug]);
		} else {
			// Check whether user is a mebemr of the institution to be redirected to `issuer/issuer` page
			this.profileManager.userProfilePromise
				.then((profile) => profile.emails.loadedPromise)
				.then((emails) => {
					// Search for primary email, since it's not alawys the first in list
					const primaryEmail = emails.entities.find((email) => email.primary).email;

					const userEmail = emails.entities[0].email;
					const isMember = issuerData.staff.entities.some(
						(staffMember) => staffMember.email === primaryEmail,
					);
					this.router.navigate([isMember ? '/issuer/issuers/' : '/public/issuers/', issuerData.slug]);
				});
		}
	}
}

class MatchingAlgorithm {
	static issuerMatcher(inputPattern: string): (issuer) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (issuer) => StringMatchingUtil.stringMatches(issuer.name, patternStr, patternExp);
	}
}

class MatchingIssuerCategory {
	constructor(
		public category: string,
		public issuer,
		public issuers: Issuer[] = [],
	) {}

	addIssuer(issuer) {
		if (issuer.category === this.category) {
			if (this.issuers.indexOf(issuer) < 0) {
				this.issuers.push(issuer);
			}
		}
	}
}
