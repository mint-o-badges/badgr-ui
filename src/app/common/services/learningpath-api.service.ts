import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { ApiLearningPath } from '../../common/model/learningpath-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LearningPathApiService extends BaseHttpApiService {
    constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	getLearningPath(lpSlug: string) {
		return this.get<ApiLearningPath>(`/v1/issuer/learningpath/${lpSlug}`).then((r) => r.body);
	}

	getLearningPathsForIssuer(issuerSlug: string) {
		return this.get<ApiLearningPath[]>(`/v1/issuer/issuers/${issuerSlug}/learningpath`).then((r) => r.body);
	}

    createLearningPath(issuerSlug: string, learningPath: ApiLearningPath) {
		return this.post<ApiLearningPath>(`/v1/issuer/issuers/${issuerSlug}/learningpath`, learningPath).then(
			(r) => r.body,
		);
	}

	updateLearningPath(issuerSlug: string, lpSlug: string, updatedLP: ApiLearningPath) {
		return this.put<ApiLearningPath>(`/v1/issuer/issuers/${issuerSlug}/learningpath/${lpSlug}`, updatedLP).then(
			(r) => r.body
		);
	}

	deleteLearningPath(issuerSlug: string, lpSlug: string) {
		return this.delete(`/v1/issuer/issuers/${issuerSlug}/learningpath/${lpSlug}`);
	}
}