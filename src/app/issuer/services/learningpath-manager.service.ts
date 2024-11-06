import { forwardRef, Inject, Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { MessageService } from '../../common/services/message.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { first, map } from 'rxjs/operators';
import { LearningPath } from '../models/learningpath.model';
import { ApiLearningPath } from '../../common/model/learningpath-api.model';
import { LearningPathApiService } from '../../common/services/learningpath-api.service';

@Injectable()
export class LearningPathManager extends BaseHttpApiService {
	learningPathList = new StandaloneEntitySet<LearningPath, ApiLearningPath>(
		(apiModel) => new LearningPath(this.commonEntityManager),
		(apiModel) => apiModel.slug,
		() => this.learningPathApi.getLearningPathsForUser(),
	);

	allLearningPathsList = new StandaloneEntitySet<LearningPath, ApiLearningPath>(
		(apiModel) => new LearningPath(this.commonEntityManager),
		(apiModel) => apiModel.slug,
		() => this.learningPathApi.getAllLearningPaths(),
	);

	get allLearningPaths$(): Observable<LearningPath[]> {
		return this.learningPathList.loaded$.pipe(map((l) => l.entities));
	}

	get allPublicLearningPaths$(): Observable<LearningPath[]> {
		return this.allLearningPathsList.loaded$.pipe(map((l) => l.entities));
	}

	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		@Inject(forwardRef(() => CommonEntityManager))
		protected commonEntityManager: CommonEntityManager,
		public learningPathApi: LearningPathApiService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	learningPathBySlug(learningPathSlug: string): Promise<LearningPath> {
		return this.allLearningPaths$
			.pipe(first())
			.toPromise()
			.then(
				(lps) =>
					lps.find((l) => l.slug === learningPathSlug) 
			);
	}
}
