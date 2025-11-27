import { useWebComponentLanguageSetting, createWebcomponent } from 'webcomponents/create-webcomponent';
import { provideHttpClient } from '@angular/common/http';
import { Component, computed, importProvidersFrom, inject, input, provideAppInitializer } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LanguageService } from '~/common/services/language.service';

import * as translationsEn from 'src/assets/i18n/en.json';
import * as translationsDe from 'src/assets/i18n/de.json';
import { IconsProvider } from '~/icons-provider';
import { RecipientBackpack } from './recipient-backpack.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';
import { ApiRecipientBadgeInstance } from '~/recipient/models/recipient-badge-api.model';
import { RecipientBadgeInstance } from '~/recipient/models/recipient-badge.model';
import { ApiLearningPath } from '~/common/model/learningpath-api.model';
import { ApiRootSkill } from '~/common/model/ai-skills.model';
import { UserProfile } from '~/common/model/user-profile.model';
import { ApiUserProfile } from '~/common/model/user-profile-api.model';

@Component({
	selector: 'oeb-earned-badges-overview',
	imports: [RecipientBackpack],
	template: `<base [href]="baseurl()" />
		@if (convertedProfile() && skills() && convertedBadges() && learningPaths()) {
			<recipient-backpack
				[profile]="convertedProfile()"
				[skills]="skills()"
				[badges]="convertedBadges()"
				[learningPaths]="learningPaths()"
				[enabledTabs]="['profile', 'badges', 'competencies', 'microdegrees']"
				[badgeUploadDisabled]="true"
				[isEmbedded]="true"
			/>
		}`,
})
class OebBackpack {
	/** URL of the server hosting the web component */
	readonly baseurl = input.required<SafeResourceUrl, string>({
		transform: (url: string | undefined) =>
			url ? this.domSanitizer.bypassSecurityTrustResourceUrl(url) : this.domSanitizer.bypassSecurityTrustHtml(''),
	});
	readonly domSanitizer = inject(DomSanitizer);
	readonly commonManager = inject(CommonEntityManager);
	readonly badges = input<ApiRecipientBadgeInstance[]>([]);
	readonly convertedBadges = computed(() => {
		if (this.badges().length > 0)
			return this.badges().map((b) => new RecipientBadgeInstance(this.commonManager, b));
		else return [];
	});
	readonly learningPaths = input<ApiLearningPath[]>([]);
	readonly skills = input<ApiRootSkill[]>([]);
	readonly profile = input<ApiUserProfile>(undefined);
	readonly convertedProfile = computed(() => {
		if (this.profile() !== undefined) return new UserProfile(this.commonManager, this.profile());
		return undefined;
	});
}

createWebcomponent(OebBackpack, 'oeb-backpack', {
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
