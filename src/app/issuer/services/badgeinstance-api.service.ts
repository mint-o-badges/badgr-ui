import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { IssuerSlug } from '../models/issuer-api.model';
import { BadgeClassSlug } from '../models/badgeclass-api.model';
import {
	ApiBadgeInstance,
	ApiBadgeInstanceForBatchCreation,
	ApiBadgeInstanceForCreation,
} from '../models/badgeinstance-api.model';
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
export class BadgeInstanceResultSet {
	instances: ApiBadgeInstance[];
	links: PaginationResults;
}

@Injectable()
export class BadgeInstanceApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	createBadgeInstance(
		issuerSlug: IssuerSlug,
		badgeSlug: BadgeClassSlug,
		creationInstance: ApiBadgeInstanceForCreation,
	) {
		return this.post<ApiBadgeInstance>(
			`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/assertions`,
			creationInstance,
		).then((r) => r.body);
	}

	createBadgeInstanceBatched(
		issuerSlug: IssuerSlug,
		badgeSlug: BadgeClassSlug,
		batchCreationInstance: ApiBadgeInstanceForBatchCreation,
	) {
		return this.post<ApiBadgeInstance[]>(
			`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batchAssertions`,
			batchCreationInstance,
		).then((r) => r.body);
	}

	createBadgeInstanceBatchedAsync(
		issuerSlug: IssuerSlug,
		badgeSlug: BadgeClassSlug,
		batchCreationInstance: ApiBadgeInstanceForBatchCreation,
	) {
		return this.post<any>(
			`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batchAssertions`,
			batchCreationInstance,
		);
	}

	checkBatchAssertionStatus(taskId: string, issuerSlug: IssuerSlug, badgeSlug: BadgeClassSlug){
		return this.get(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batch-assertions/status/${taskId}`)
	}

	listBadgeInstances(
		issuerSlug: string,
		badgeSlug: string,
		query?: string,
		num = 100,
	): Promise<BadgeInstanceResultSet> {
		let url = `/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/assertions?num=${num}`;
		if (query) {
			url += `&recipient=${query}`;
		}
		return this.get(url).then(this.handleAssertionResult);
	}

	getBadgeInstancePage(paginationUrl: string): Promise<BadgeInstanceResultSet> {
		return this.get(paginationUrl).then(this.handleAssertionResult);
	}

	revokeBadgeInstance(issuerSlug: string, badgeSlug: string, badgeInstanceSlug: string, revocationReason: string) {
		return this.delete(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/assertions/${badgeInstanceSlug}`, {
			revocation_reason: revocationReason,
		});
	}

	private handleAssertionResult = (r: HttpResponse<ApiBadgeInstance[]>) => {
		const resultset = new BadgeInstanceResultSet();

		if (r.headers.has('link')) {
			const link = r.headers.get('link');

			resultset.links = new PaginationResults(link);
		}

		resultset.instances = r.body || [];

		return resultset;
	};
}
