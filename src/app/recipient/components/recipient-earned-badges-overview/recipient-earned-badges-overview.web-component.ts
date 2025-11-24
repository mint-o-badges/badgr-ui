import { useWebComponentLanguageSetting, createWebcomponent } from 'webcomponents/create-webcomponent';
import { provideHttpClient } from '@angular/common/http';
import { Component, computed, importProvidersFrom, inject, input, provideAppInitializer } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { LanguageService } from '~/common/services/language.service';
import * as translationsEn from 'src/assets/i18n/en.json';
import * as translationsDe from 'src/assets/i18n/de.json';
import RecipientEarnedBadgesOverview from './recipient-earned-badges-overview.component';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';
import { ApiRecipientBadgeInstance } from '~/recipient/models/recipient-badge-api.model';
import { RecipientBadgeInstance } from '~/recipient/models/recipient-badge.model';
import { IconsProvider } from '~/icons-provider';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';

@Component({
	selector: 'oeb-earned-badges-overview',
	imports: [RecipientEarnedBadgesOverview],
	template: `<div class="oeb page-padding">
		<div class="tw-bg-lightpurple oeb-inset-padding">
			<recipient-earned-badges-overview [badges]="convertedBadges()" [isEmbedded]="true" />
		</div>
	</div>`,
})
class OebEarnedBadgesOverview {
	readonly commonManager = inject(CommonEntityManager);
	readonly badges = input<ApiRecipientBadgeInstance[]>([]);
	readonly convertedBadges = computed(() => {
		if (this.badges().length > 0)
			return this.badges().map((b) => new RecipientBadgeInstance(this.commonManager, b));
		else return [];
	});
}

createWebcomponent(OebEarnedBadgesOverview, 'oeb-earned-badges-overview', {
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
		provideAnimations(),
		provideRouter([] as Routes),
	],
});
