import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { IssuerSlug } from '../models/issuer-api.model';
import {
	ApiCollectionBadgeInstance,
	ApiCollectionBadgeInstanceForBatchCreation,
	ApiCollectionBadgeInstanceForCreation,
} from '../models/collectionbadge-instance-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient, HttpResponse } from '@angular/common/http';

export class PaginationResults {
	private _links = {};

	constructor(linkHeader?: string) {
		if (linkHeader) {
			this.parseLinkHeader(linkHeader);
		}
	}
	parseLinkHeader(linkHeader: string) {
		const re = /<([^>]+)>; rel="([^"]+)"/g;
		let match;
		do {
			match = re.exec(linkHeader);
			if (match) {
				this._links[match[2]] = match[1];
			}
		} while (match);
	}

	get hasNext(): boolean {
		return 'next' in this._links;
	}
	get hasPrev(): boolean {
		return 'prev' in this._links;
	}
	get nextUrl() {
		return this._links['next'];
	}
	get prevUrl() {
		return this._links['prev'];
	}
}
export class CollectionBadgeInstanceResultSet {
	instances: ApiCollectionBadgeInstance[];
	links: PaginationResults;
}

@Injectable()
export class CollectionBadgeInstanceApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	createCollectionBadgeInstance(
		issuerSlug: IssuerSlug,
		collectionBadgeSlug: string,
		creationInstance: ApiCollectionBadgeInstanceForCreation,
	) {
		return this.post<ApiCollectionBadgeInstance>(
			`/v1/issuer/issuers/${issuerSlug}/collectionbadges/${collectionBadgeSlug}/assertions`,
			creationInstance,
		).then((r) => r.body);
	}

	createBadgeInstanceBatched(
		issuerSlug: IssuerSlug,
		collectionBadgeSlug: string,
		batchCreationInstance: ApiCollectionBadgeInstanceForBatchCreation,
	) {
		return this.post<ApiCollectionBadgeInstance[]>(
			`/v1/issuer/issuers/${issuerSlug}/collectionbadges/${collectionBadgeSlug}/batchAssertions`,
			batchCreationInstance,
		).then((r) => r.body);
	}

	listCollectionBadgeInstances(
		issuerSlug: string,
		badgeSlug: string,
		query?: string,
		num = 100,
	): Promise<CollectionBadgeInstanceResultSet> {
		let url = `/v1/issuer/issuers/${issuerSlug}/collectionbadges/${badgeSlug}/assertions?num=${num}`;
		if (query) {
			url += `&recipient=${query}`;
		}
		return this.get(url).then(this.handleAssertionResult);
	}

	getBadgeInstancePage(paginationUrl: string): Promise<CollectionBadgeInstanceResultSet> {
		return this.get(paginationUrl).then(this.handleAssertionResult);
	}

	revokeBadgeInstance(issuerSlug: string, badgeSlug: string, badgeInstanceSlug: string, revocationReason: string) {
		return this.delete(
			`/v1/issuer/issuers/${issuerSlug}/collectionbadges/${badgeSlug}/assertions/${badgeInstanceSlug}`,
			{
				revocation_reason: revocationReason,
			},
		);
	}

	private handleAssertionResult = (r: HttpResponse<ApiCollectionBadgeInstance[]>) => {
		const resultset = new CollectionBadgeInstanceResultSet();

		if (r.headers.has('link')) {
			const link = r.headers.get('link');

			resultset.links = new PaginationResults(link);
		}

		resultset.instances = r.body || [];

		return resultset;
	};
}
