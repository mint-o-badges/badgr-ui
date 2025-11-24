import { useWebComponentLanguageSetting, createWebcomponent } from 'webcomponents/create-webcomponent';
import { provideHttpClient } from '@angular/common/http';
import { Component, computed, importProvidersFrom, inject, input, provideAppInitializer } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { LanguageService } from '~/common/services/language.service';
import * as translationsEn from 'src/assets/i18n/en.json';
import * as translationsDe from 'src/assets/i18n/de.json';
import { RecipientCompetencyOverview } from './recipient-competency-overview.component';
import { RecipientBadgeInstance } from '~/recipient/models/recipient-badge.model';
import { ApiRecipientBadgeInstance } from '~/recipient/models/recipient-badge-api.model';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';
import { IconsProvider } from '~/icons-provider';

@Component({
	selector: 'oeb-competency-overview',
	imports: [RecipientCompetencyOverview],
	template: ` <recipient-competency-overview [badges]="convertedBadges()" />`,
})
class OebCompetencyOverview {
	readonly commonManager = inject(CommonEntityManager);
	readonly badges = input<ApiRecipientBadgeInstance[]>([]);
	readonly convertedBadges = computed(() => {
		if (this.badges().length > 0)
			return this.badges().map((b) => new RecipientBadgeInstance(this.commonManager, b));
		else return [];
	});
}

createWebcomponent(OebCompetencyOverview, 'oeb-competency-overview', {
	providers: [
		provideHttpClient(),
		importProvidersFrom(BrowserModule, TranslateModule.forRoot()),
		provideAppInitializer(() => {
			const translate = inject(TranslateService);
			translate.setTranslation('en', translationsEn);
			translate.setTranslation('de', translationsDe);

			const lang = inject(LanguageService);
			useWebComponentLanguageSetting(lang);
		}),
		IconsProvider,
	],
});
