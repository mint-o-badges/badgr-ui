import { Injectable, inject } from '@angular/core';
import { BadgrApiError, BaseHttpApiService } from './base-http-api.service';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { MessageService } from './message.service';
import { AUTH_PROVIDER, AuthenticationService } from './authentication-service';

const ENDPOINT = 'v3/user/preferences';

@Injectable({
	providedIn: 'root',
})
export class UserPreferenceService extends BaseHttpApiService {
	protected sessionService: AuthenticationService;
	protected httpClient: HttpClient;
	protected configService: AppConfigService;
	protected messageService: MessageService;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const sessionService = inject(AUTH_PROVIDER);
		const httpClient = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(sessionService, httpClient, configService, messageService);

		this.sessionService = sessionService;
		this.httpClient = httpClient;
		this.configService = configService;
		this.messageService = messageService;
	}

	/**
	 * Requests a preference by its key from the backend and returns the value
	 * as string if found.
	 * @param key A key under which the preference is found in the database
	 * @param defaultValue The default value to use if the preference cannot be found
	 * @returns If the user is not logged in, returns undefined. Otherwise the value
	 * for the preference as stored in the database is returned. If there is no value
	 * the provided defaultValue is returned. If the request fails, null is returned.
	 */
	async getPreference(key: string, defaultValue: string): Promise<string | undefined | null> {
		if (!this.sessionService.isLoggedIn) return undefined;
		try {
			const response = await this.get<string>(`${this.baseUrl}/${ENDPOINT}/${key}/`);
			if (response.ok && response.body['value'].length > 0) return response.body['value'];
			else return defaultValue;
		} catch (e) {
			if (e instanceof BadgrApiError && e.response.status === 404) return defaultValue;
			console.warn(e);
			return null;
		}
	}

	/**
	 * Sets the preferences on the backend to the given value or deletes it
	 * if the value is set to undefined.
	 * @param key A key under which the preference is found in the database     *
	 * @param value The value to set the preference to. Setting it to undefined will
	 * delete the preference from the database.
	 * @returns If the user is not logged in, returns undefined. Otherwise a boolean
	 * indicating whether the request was successful is returned.
	 */
	async setPreference(key: string, value: string | undefined): Promise<boolean | undefined> {
		if (!this.sessionService.isLoggedIn) return undefined;

		try {
			const response = await (value === undefined
				? this.delete(`${this.baseUrl}/${ENDPOINT}/${key}/`, value)
				: this.post(`${this.baseUrl}/${ENDPOINT}/`, { key: key, value: value }));
			if (!response.ok) {
				console.warn(`Setting preference ${key} did not return successfully, response code ${response.status}`);
				return false;
			}

			return true;
		} catch (e) {
			console.warn(e);
			return false;
		}
	}
}
