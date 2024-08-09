import { Component, Input, OnInit } from "@angular/core";
import { BrnAccordionContentComponent, BrnAccordionDirective } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from '../../../../app/components/spartan/ui-accordion-helm/src';
import { HlmIconModule, provideIcons } from '../../../../app/components/spartan/ui-icon-helm/src';
import { TranslateModule } from "@ngx-translate/core";
import { RouterModule } from "@angular/router";
import { NgFor, NgIf, NgClass } from "@angular/common";
import { OebSeparatorComponent } from "../../../components/oeb-separator.component";
import { OebButtonComponent } from "../../../components/oeb-button.component";
import { BadgeRequestApiService } from "../../services/badgerequest-api.service";
import { QrCodeDatatableComponent } from "../../../components/datatable-qrcodes.component";

@Component({
	selector: 'qrcode-awards',
	templateUrl: './qrcode-awards.component.html',
    standalone: true,
    providers: [BrnAccordionDirective, BadgeRequestApiService],
    imports: [
		HlmAccordionModule,
		HlmIconModule,
		TranslateModule,
		BrnAccordionContentComponent,
		RouterModule,
		NgIf,
		NgFor,
		NgClass,
		OebSeparatorComponent,
		OebButtonComponent,
		QrCodeDatatableComponent
	],
})

export class QrCodeAwardsComponent implements OnInit {

	constructor(private badgeRequestApiService: BadgeRequestApiService) {}
	separatorStyle = "tw-block tw-my-2 tw-border-[var(--color-lightgray)]"

    @Input() awards: any[]
	@Input() routerLink: string[]
	@Input() badgeClassSlug: string

	requestedBadges: any[] = []

	ngOnInit(): void {

		console.log(this.awards)
		// this.badgeRequestApiService.getBadgeRequestsByQrCode(this.qrCodeId).then((requestedBadges) => {
		// 	console.log(requestedBadges)
		// })
	}

}