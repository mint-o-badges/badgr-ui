import { forwardRef, Inject, Injectable } from '@angular/core';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import {
	ApiExternalTool,
	ApiExternalToolLaunchInfo,
	ApiExternalToolLaunchpoint,
	ExternalToolLaunchpointName,
} from '../models/externaltools-api.model';
import { ExternalTool } from '../models/externaltools.model';
import { ExternalToolsApiService } from './externaltools-api.service';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ExternalToolsManager {
	externaltoolsList = new StandaloneEntitySet<ExternalTool, ApiExternalTool>(
		(apiModel) => new ExternalTool(this.commonEntityManager),
		(apiModel) => apiModel.slug,
		() => this.externalToolsApiService.listTools(),
	);

	constructor(
		public externalToolsApiService: ExternalToolsApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager,
	) {}

	get allExternalTools$(): Observable<ExternalTool[]> {
		return this.externaltoolsList.loaded$.pipe(map((l) => l.entities));
	}

	getToolLaunchpoints(launchpointName: ExternalToolLaunchpointName): Promise<ApiExternalToolLaunchpoint[]> {
		return this.allExternalTools$
			.pipe(first())
			.toPromise()
			.then((externaltools) =>
				externaltools
					.map((tool) => tool.launchpoints[launchpointName] as ApiExternalToolLaunchpoint)
					.filter(Boolean),
			);
	}

	getLaunchInfo(launchpoint: ApiExternalToolLaunchpoint, contextId: string): Promise<ApiExternalToolLaunchInfo> {
		return this.externalToolsApiService.getLaunchToolInfo(launchpoint, contextId);
	}
}
