import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BgImageStatusPlaceholderDirective } from '../../common/directives/bg-image-status-placeholder.directive';
import { HlmH2Directive } from '../spartan/ui-typography-helm/src/lib/hlm-h2.directive';
import { TruncatedTextComponent } from '../../common/components/truncated-text.component';
import { HlmPDirective } from '../spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { HlmBadgeDirective } from '../spartan/ui-badge-helm/src/lib/hlm-badge.directive';
import { RouterLink } from '@angular/router';
import { NgIf, I18nPluralPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

export interface Issuer {
	image: string;
	imagePlaceholder: string;
	name: string;
	description: string;
	category: string;
	slug: string;
	badgeClassCount: number;
	learningPathCount: number;
	// Add other properties as needed
}

@Component({
    selector: 'oeb-issuer-card',
    templateUrl: './issuer-card.component.html',
    styleUrls: ['./issuer-card.component.css'],
    imports: [
        BgImageStatusPlaceholderDirective,
        HlmH2Directive,
        TruncatedTextComponent,
        HlmPDirective,
        HlmBadgeDirective,
        RouterLink,
        NgIf,
        I18nPluralPipe,
        TranslatePipe,
    ],
})
export class IssuerCardComponent {
	@Input() issuer: Issuer; // Single input for the entire object
	@Input() plural: any; // If needed for pluralization logic

	@Output() navigate = new EventEmitter<void>();

	onNavigate() {
		this.navigate.emit();
	}
}
