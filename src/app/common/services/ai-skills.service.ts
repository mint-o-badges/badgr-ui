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

    // Inspired by
    // - https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
    // - https://stackoverflow.com/questions/5234581/base64url-decoding-via-javascript
    toBase64Url(text: string): string {
        // To allow for unicode characters, convert it to a binary string first
        const bytes = new TextEncoder().encode(text);
        const binString = Array.from(bytes, (byte) =>
                                                 String.fromCodePoint(byte),
                                                ).join("");
        const base64 = btoa(binString);
        // To make it url safe, replace + and /
        return base64.replace('/\+/g', '-').replace('/\//g', '_');
    }

	getAiSkillsResult(textToAnalyze: string): Promise<AiSkillsResult> {
		// TODO: Potentially it would be better to transfer the text to analyze in the body,
		// since it could become quite long. For this howerver, POST needs to be used.
		// This either (probably) failed with some CSRF stuff (though there was no clear error message
		// indicating this) or the authentication had to be removed (that's how it was done for uploading image).
		// Removing authentication could lead to attacks though and I didn't manage to fix the CSRF stuff
		// (I've tried for hours to add the correct headers etc., it all failed with a 403 without an error message).
        // Since the url lenght limit *probably* isn't too short anyway, for now this solution should suffice.
        return this.get<AiSkillsResult>(`/aiskills/${this.toBase64Url(textToAnalyze)}`).then(
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
}
