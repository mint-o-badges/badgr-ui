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
		// 1. check if device default lang can be fetched and it's one of the supported language
		// 2. use german as a default lang
		let browserLang = this.translate.getBrowserCultureLang(); // Get browser lang
		let browserLangVal = browserLang.toLowerCase().slice(0, 2);

		//ToDo: comment in when all pages are completely translated
		/* if (lngs.includes(browserLangVal)) {
			this.translate.setDefaultLang(browserLangVal);
			this.setLanguage(browserLangVal);
		} else {
			this.setLanguage('de'); // german is the default lang if browser lang is not supported
		} */

		// set language to german only
		this.setLanguage('de');
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
