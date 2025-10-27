import { Injectable, inject } from '@angular/core';
import { QueryParametersService } from './query-parameters.service';

/**
 * Service to detect whether Badgr is being viewed in an embedded context, such as an iframe.
 */
@Injectable({ providedIn: 'root' })
export class EmbedService {
	private paramService = inject(QueryParametersService);

	readonly embedVersion: number | null;
	readonly embedSize: {
		width: number;
		height: number;
	} | null;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const paramService = this.paramService;

		this.embedVersion = parseFloat(paramService.queryStringValue('embedVersion', true)) || null;

		if (this.embedVersion) {
			this.embedSize = {
				width: parseFloat(paramService.queryStringValue('embedWidth', true)) || null,
				height: parseFloat(paramService.queryStringValue('embedHeight', true)) || null,
			};
		}
	}

	get isEmbedded() {
		return !!this.embedVersion;
	}

	isEmbedVersion(ver: number) {
		return this.embedVersion === ver;
	}
}
