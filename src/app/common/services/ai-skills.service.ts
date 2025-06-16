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
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	getAiSkillsResult(textToAnalyze: string): Promise<AiSkillsResult> {
		return this.post<AiSkillsResult>(`/aiskills/`, {
			'text': textToAnalyze
		}).then(
			(r) => r.body as AiSkillsResult,
			(error) => {
				throw new Error(JSON.parse(error.message).error);
			},
		);
	}

	getAiSkills(textToAnalyze: string): Promise<Skill[]> {
		return this.getAiSkillsResult(textToAnalyze).then(
			(result: AiSkillsResult) => result.skills,
			(error) => {
				throw error;
			},
		);
	}

	getAiKeywordSkillsResult(query: string, language: string): Promise<AiSkillsResult> {
		return this.post<AiSkillsResult>(`/aiskills-keywords/`, {
			'keyword': query,
			'lang': language
		}).then(
			(r) => r.body as AiSkillsResult,
			(error) => {
				throw new Error(JSON.parse(error.message).error);
			},
		);
	}

	getAiKeywordSkills(query: string, language = 'de'): Promise<Skill[]> {
		return this.getAiKeywordSkillsResult(query, language).then(
			(result: AiSkillsResult) => result.skills,
			(error) => {
				throw error;
			},
		);
	}
}
