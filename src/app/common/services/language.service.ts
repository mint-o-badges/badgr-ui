import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const LNG_KEY = 'SELECTED_LANGUAGE';
const lngs = ['de', 'en'];

@Injectable({
	providedIn: 'root',
})
export class LanguageService {
	private selected_lng$: BehaviorSubject<string>;

	constructor(private translate: TranslateService) {
		this.selected_lng$ = new BehaviorSubject(null);
	}

	setInitialAppLangauge() {
		let language = window.localStorage.getItem('lang');
		if (!language) {
			if (navigator.language.toLocaleLowerCase().indexOf('de') == 0) {
				language = 'de';
			} else {
				language = 'en';
			}
			window.localStorage.setItem('lang', language);
		}
		this.setLanguage(language);
	}

	getLangauges() {
		return [
			{ value: 'de', img: 'DE', text: 'Deutsch' },
			{ value: 'en', img: 'EN', text: 'English' },
		];
	}

	// To set language
	setLanguage(lng) {
		this.translate.use(lng.toLowerCase());
		this.setSelectedLngValue(lng);
	}

	// selected language observer, getter ans setter
	getSelectedLngObs() {
		return this.selected_lng$.asObservable();
	}
	getSelectedLngValue() {
		return this.selected_lng$.getValue();
	}
	setSelectedLngValue(sel_lng: string) {
		return this.selected_lng$.next(sel_lng);
	}
}
