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
        // TODO: Potentially it would be better to transfer the text to analyze in the body,
        // since it could become quite long. For this howerver, POST needs to be used.
        // This either (probably) failed with some CSRF stuff (though there was no clear error message
        // indicating this) or the authentication had to be removed (that's how it was done for uploading image).
        // Removing authentication could lead to attacks though and I didn't manage to fix the CSRF stuff
        // (I've tried for hours to add the correct headers etc., it all failed with a 403 without an error message).
        // Since the url lenght limit *probably* isn't too short anyway, for now this solution should suffice.
        return this
            .get<AiSkillsResult>(`/aiskills/${encodeURIComponent(textToAnalyze)}`)
            .then(r => r.body as AiSkillsResult,
                  error => ({
                "id": "",
                "text_to_analyze": textToAnalyze,
                "skills": [],
                "status": "failed"
            } as AiSkillsResult));
    }

    getAiSkills(textToAnalyze: string): Promise<Skill[]> {
        return this
            .getAiSkillsResult(textToAnalyze)
            .then((result: AiSkillsResult) => result.skills,
                  error => []);
    }
}
