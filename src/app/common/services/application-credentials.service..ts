import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { BaseHttpApiService } from './base-http-api.service';
import { SessionService } from './session.service';
import { MessageService } from './message.service';
import { EventsService } from './events.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApplicationCredentialsService extends BaseHttpApiService {
	protected sessionService: SessionService;
	protected http: HttpClient;
	protected configService: AppConfigService;
	protected messageService: MessageService;
	protected eventsService = inject(EventsService);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const sessionService = inject(SessionService);
		const http = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(sessionService, http, configService, messageService);

		this.sessionService = sessionService;
		this.http = http;
		this.configService = configService;
		this.messageService = messageService;
	}

	generateCredentials(data) {
		if (this.sessionService.isLoggedIn) {
			return this.post('/o/publicregister', data).then((r) => r.body);
		} else {
			return Promise.reject('No user logged in');
		}
	}

	getMyCredentials() {
		if (this.sessionService.isLoggedIn) {
			return this.get('/v2/auth/applications').then((r) => r.body);
		} else {
			return Promise.reject('No user logged in');
		}
	}
	deleteCredentials(clientId) {
		if (this.sessionService.isLoggedIn) {
			return this.delete(`/v2/auth/applications/${clientId}`).then((r) => r.body);
		} else {
			return Promise.reject('No user logged in');
		}
	}
}
