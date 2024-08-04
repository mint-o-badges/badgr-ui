import { Component, Input } from "@angular/core";
import { BrnAccordionContentComponent, BrnAccordionDirective } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from '../../../../app/components/spartan/ui-accordion-helm/src';
import { HlmIconModule, provideIcons } from '../../../../app/components/spartan/ui-icon-helm/src';
import { TranslateModule } from "@ngx-translate/core";
import { RouterModule } from "@angular/router";
import { NgIf } from "@angular/common";
import { OebSeparatorComponent } from "../../../components/oeb-separator.component";
import { OebButtonComponent } from "../../../components/oeb-button.component";

@Component({
	selector: 'qrcode-awards',
	templateUrl: './qrcode-awards.component.html',
    standalone: true,
    providers: [BrnAccordionDirective],
    imports: [
		HlmAccordionModule,
		HlmIconModule,
		TranslateModule,
		BrnAccordionContentComponent,
		RouterModule,
		NgIf,
		OebSeparatorComponent,
		OebButtonComponent
	],
})

export class QrCodeAwardsComponent {
	separatorStyle = "tw-block tw-my-2 tw-border-[var(--color-lightgray)] tw-border"

    @Input() awards: any[]
	@Input() routerLink: string[]

}