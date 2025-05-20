import { Injectable } from '@angular/core';
import { BaseHttpApiService } from './base-http-api.service';
import { SessionService } from './session.service';
import { AppConfigService } from '../app-config.service';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CmsApiMenu, CmsApiPage, CmsApiPost } from '../model/cms-api.model';
import { lastValueFrom } from 'rxjs';
import { LanguageService } from './language.service';

@Injectable()
export class CmsApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
		protected languageService: LanguageService
	) {
		super(loginService, http, configService, messageService);
	}

	getMenus() {
		return this.get<CmsApiMenu>('/cms/menu/list/', null, false, false)
			.then((r) => r.body)
		;
	}

	getPageByID(ID: number) {
		return this.get<CmsApiPage>(`/cms/page/${ID}`, null, false, false)
			.then((r) => r.body)
		;
	}

	getPageBySlug(slug: string) {
		return this.get<CmsApiPage>(`/cms/page/slug/`, { 'slug': slug }, false, false)
			.then((r) => r.body)
		;
	}

	getPostBySlug(slug: string) {
		return this.get<CmsApiPage>(`/cms/post/slug/`, { 'slug': slug }, false, false)
			.then((r) => r.body)
		;
	}

	getPosts() {
		return this.get<CmsApiPost[]>(`/cms/post/list/`, { 'lang': this.languageService.getSelectedLngValue()}, false, false)
			.then((r) => r.body)
		;
	}

	getStyles() {
		// lastValueFrom instead of deprecated .toPromise()
		return lastValueFrom(this.http.get(`${this.configService.apiConfig.baseUrl}/cms/style`, { responseType: 'text' }));
	}

}
