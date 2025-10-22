import { Injectable, inject } from '@angular/core';
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
import { ApiLearningPath, ApiLearningPathForCreation } from '../../common/model/learningpath-api.model';
import { LearningPathApiService } from '../../common/services/learningpath-api.service';

@Injectable({ providedIn: 'root' })
export class LearningPathManager extends BaseHttpApiService {
	protected loginService: SessionService;
	protected http: HttpClient;
	protected configService: AppConfigService;
	protected commonEntityManager = inject(CommonEntityManager);
	learningPathApi = inject(LearningPathApiService);
	protected messageService: MessageService;

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

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const loginService = inject(SessionService);
		const http = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(loginService, http, configService, messageService);
	
		this.loginService = loginService;
		this.http = http;
		this.configService = configService;
		this.messageService = messageService;
	}

	createLearningPath(issuerSlug: string, newLp: ApiLearningPathForCreation): Promise<LearningPath> {
		return this.learningPathApi.createLearningPath(issuerSlug, newLp).then((retNewBadge) => {
			this.allLearningPathsList.addOrUpdate(retNewBadge);
			return this.learningPathList.addOrUpdate(retNewBadge);
		});
	}

	async getLearningPathForIssuer(issuerSlug: string, lpSlug: string): Promise<LearningPath> {
		const apiLearningPath = await this.learningPathApi.getLearningPath(issuerSlug, lpSlug);
		return new LearningPath(this.commonEntityManager, apiLearningPath);
	}

	learningPathBySlug(learningPathSlug: string): Promise<LearningPath> {
		return this.allLearningPaths$
			.pipe(first())
			.toPromise()
			.then((lps) => lps.find((l) => l.slug === learningPathSlug));
	}
}
