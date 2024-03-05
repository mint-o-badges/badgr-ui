import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { AiSkillsResult, Skill } from '../model/ai-skills.model';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';

@Injectable()
export class AiSkillsService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService
	) {
        super(loginService, http, configService, messageService);
    }

    getAiSkillsResult(textToAnalyze: string): Promise<AiSkillsResult> {
        return this
            .get<{result: AiSkillsResult}>(`/aiskills/${textToAnalyze}`)
            .then(r => r.body.result as AiSkillsResult,
                  error => {
                "id": "",
                "text_to_analyze": textToAnalyze,
                "skills": [],
                "status": "failed"
            });
    }

    getAiSkills(textToAnalyze: string): Promise<Skill[]> {
        return this
            .getAiSkillsResult(textToAnalyze)
            .then(result: AiSkillsResult => result.skills,
                  error => []);
    }
}
