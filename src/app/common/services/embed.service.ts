import { Injectable } from '@angular/core';
import { QueryParametersService } from './query-parameters.service';

/**
 * Service to detect whether Badgr is being viewed in an embedded context, such as an iframe.
 */
@Injectable()
export class EmbedService {
	readonly embedVersion: number | null;
	readonly embedSize: {
		width: number;
		height: number;
	} | null;

	constructor(private paramService: QueryParametersService) {
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
