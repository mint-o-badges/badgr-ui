import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BgImageStatusPlaceholderDirective } from '../../common/directives/bg-image-status-placeholder.directive';
import { TruncatedTextComponent } from '../../common/components/truncated-text.component';
import { HlmBadge } from '../spartan/ui-badge-helm/src/lib/hlm-badge.directive';
import { RouterLink } from '@angular/router';
import { I18nPluralPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { preloadImageURL } from '../../common/util/file-util';
import { HlmH2, HlmP } from '@spartan-ng/helm/typography';
import { TranslateService } from '@ngx-translate/core';
import { Issuer } from '~/issuer/models/issuer.model';

@Component({
	selector: 'oeb-issuer-card',
	templateUrl: './issuer-card.component.html',
	styleUrls: ['./issuer-card.component.css'],
	imports: [
		BgImageStatusPlaceholderDirective,
		HlmH2,
		TruncatedTextComponent,
		HlmP,
		HlmBadge,
		RouterLink,
		I18nPluralPipe,
		TranslatePipe,
	],
})
export class IssuerCardComponent {
	@Input() issuer: Issuer;

	@Output() navigate = new EventEmitter<void>();

	constructor(private translate: TranslateService) {}
	readonly issuerImagePlaceHolderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	plural = {};

	onNavigate() {
		this.navigate.emit();
	}

	prepareTexts() {
		this.plural = {
			badges: {
				'=0': this.translate.instant('Badge.noBadges'),
				'=1': this.translate.instant('Badge.oneBadge'),
				other: this.translate.instant('Badge.multiBadges'),
			},
		};
	}
}
