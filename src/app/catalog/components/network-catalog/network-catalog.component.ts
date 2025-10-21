import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { FormsModule } from '@angular/forms';
import { appearAnimation } from '../../../common/animations/animations';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { CountUpModule } from 'ngx-countup';
import { OebNetworkCard } from '~/common/components/oeb-networkcard.component';
import { RouterLink } from '@angular/router';
import { CatalogService } from '~/catalog/catalog.service';
import { toObservable } from '@angular/core/rxjs-interop';
import {
	combineLatest,
	concatMap,
	debounceTime,
	distinctUntilChanged,
	filter,
	firstValueFrom,
	skip,
	Subscription,
	tap,
} from 'rxjs';
import { OebHeaderText } from '~/components/oeb-header-text.component';
import { NetworkV3 } from '~/issuer/models/networkv3.model';
import { LoadingDotsComponent } from '~/common/components/loading-dots.component';
import { OebButtonComponent } from '~/components/oeb-button.component';

@Component({
	selector: 'app-network-catalog',
	templateUrl: './network-catalog.component.html',
	animations: [appearAnimation],
	imports: [
		FormMessageComponent,
		CountUpModule,
		FormsModule,
		OebNetworkCard,
		RouterLink,
		OebHeaderText,
		LoadingDotsComponent,
		OebButtonComponent,
		TranslatePipe,
	],
})
export class NetworkCatalogComponent extends BaseRoutableComponent implements OnInit, AfterViewInit, OnDestroy {
	readonly NETWORKS_PER_PAGE = 20;
	readonly INPUT_DEBOUNCE_TIME = 400;
	@ViewChild('loadMore') loadMore: ElementRef | undefined;
	networks = signal<NetworkV3[]>([]);
	intersectionObserver: IntersectionObserver | undefined;
	pageSubscriptions: Subscription[] = [];
	sortOption = signal<'name_asc' | 'name_desc'>('name_asc');
	sortOption$ = toObservable(this.sortOption);
	observeScrolling = signal<boolean>(false);
	observeScrolling$ = toObservable(this.observeScrolling);
	currentPage = signal<number>(-1);
	currentPage$ = toObservable(this.currentPage);
	searchQuery = signal<string>('');
	searchQuery$ = toObservable(this.searchQuery);
	hasNext = signal<boolean>(true);
	public loggedIn = false;
	totalNetworkCount = signal<number>(0);

	constructor(
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected catalogService: CatalogService,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
		public sessionService: SessionService,
		protected profileManager: UserProfileManager,
	) {
		super(router, route);
	}

	private async loadRangeOfNetworks(pageNumber: number, searchQuery: string, sortOption: 'name_asc' | 'name_desc') {
		try {
			const result = await this.catalogService.getNetworks(
				pageNumber * this.NETWORKS_PER_PAGE,
				this.NETWORKS_PER_PAGE,
				searchQuery,
				sortOption,
			);

			if (!result) {
				return null;
			}

			return result;
		} catch (error) {
			return null;
		}
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

	ngOnInit() {
		this.loggedIn = this.sessionService.isLoggedIn;

		this.pageSubscriptions.push(
			this.observeScrolling$.pipe(filter((_) => this.intersectionObserver !== undefined)).subscribe((observe) => {
				if (observe) this.intersectionObserver!.observe(this.loadMore!.nativeElement);
				else this.intersectionObserver!.unobserve(this.loadMore!.nativeElement);
			}),
		);

		this.pageSubscriptions.push(
			combineLatest([this.currentPage$, this.searchQuery$, this.sortOption$], (v1, v2, v3) => ({
				page: v1,
				searchQuery: v2,
				sortOption: v3,
			}))
				.pipe(
					debounceTime(this.INPUT_DEBOUNCE_TIME),
					filter((i) => i.page >= 0),
					distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
					tap((_) => this.observeScrolling.set(false)),
					concatMap((i) => this.loadRangeOfNetworks(i.page, i.searchQuery, i.sortOption)),
				)
				.subscribe((paginatedNetworks) => {
					this.totalNetworkCount.set(paginatedNetworks.total_count);
					if (!paginatedNetworks) {
						this.observeScrolling.set(true);
						return;
					}

					this.hasNext.set(paginatedNetworks?.next !== null);

					if (!paginatedNetworks?.previous) {
						this.networks.set(paginatedNetworks?.results ?? []);
					} else {
						this.networks.update((currentNetworks) => [...currentNetworks, ...paginatedNetworks.results]);
					}

					this.observeScrolling.set(true);
				}),
		);

		this.pageSubscriptions.push(
			this.currentPage$.subscribe((p) => {
				if (p === 0) window?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
			}),
		);

		this.currentPage.set(0);
	}

	ngAfterViewInit() {
		if (this.loadMore) {
			this.intersectionObserver = this.setupIntersectionObserver(this.loadMore);
		}
	}

	ngOnDestroy() {
		this.pageSubscriptions.forEach((sub) => sub.unsubscribe());

		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
		}
	}

	get networksPluralWord(): string {
		const count = this.totalNetworkCount();
		if (count === 1) return this.translate.instant('Network.networkRegistered');
		return this.translate.instant('Network.networksRegistered');
	}

	onLoadMoreClicked() {
		if (this.hasNext()) this.currentPage.update((p) => p + 1);
	}
}
