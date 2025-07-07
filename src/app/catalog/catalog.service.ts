import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '~/common/app-config.service';
import { BaseHttpApiService } from '~/common/services/base-http-api.service';
import { MessageService } from '~/common/services/message.service';
import { SessionService } from '~/common/services/session.service';
import { BadgeClass } from '~/issuer/models/badgeclass.model';
import { BadgeClassV3, IBadgeClassV3 } from '~/issuer/models/badgeclassv3.model';

const ENDPOINT = 'v3/issuer';

@Injectable({
	providedIn: 'root',
})
export class CatalogService extends BaseHttpApiService {
	constructor(
		protected sessionService: SessionService,
		protected httpClient: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(sessionService, httpClient, configService, messageService);
	}

	async loadBadges(
		offset: number = 0,
		limit: number = 20,
		nameQuery?: string,
		tags?: string[],
	): Promise<PaginatedBadgeClass | null> {
		try {
			let params = new HttpParams({
				fromObject: {
					offset: offset,
					limit: limit,
				},
			});

			if (nameQuery) params = params.append('name', nameQuery);
			if (tags && tags.length > 0) params = params.append('tags', tags.join(','));

			const response = await this.get<PaginatedBadgeClass & { results: IBadgeClassV3[] }>(
				`${this.baseUrl}/${ENDPOINT}/badges/`,
				params,
			);

			if (response.ok)
				return { ...response.body, results: response.body.results.map((r) => new BadgeClassV3(r)) };
			else {
				console.warn(
					`Paginated request to get badge classes did not return ok, got ${response.status}: ${response.statusText}`,
				);
				return null;
			}
		} catch (e) {
			console.warn(e);
			return null;
		}
	}
}

export interface PaginatedBadgeClass {
	count: number;
	next: string | null;
	previous: string | null;
	results: BadgeClassV3[];
}
