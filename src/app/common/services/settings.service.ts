import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {
	constructor() {}

	loadSettings<T>(settingsId: string, defaults: T) {
		try {
			const settingsString = window.localStorage['settings-' + settingsId] || '{}';
			return Object.assign({}, defaults, JSON.parse(settingsString));
		} catch (e) {
			console.error(`Failed to load settings: ${settingsId}`, e);
			return Object.assign({}, defaults);
		}
	}

	saveSettings(settingsId: string, settings: unknown) {
		try {
			window.localStorage['settings-' + settingsId] = JSON.stringify(settings);
		} catch (e) {
			console.error(`Failed to save settings for ${settingsId}`, e);
		}
	}
}
