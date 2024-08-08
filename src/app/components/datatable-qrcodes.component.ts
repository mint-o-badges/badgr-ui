import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { OebButtonComponent } from './oeb-button.component';
import { BadgeRequestApiService } from '../issuer/services/badgerequest-api.service';

@Component({
	selector: 'qrcodes-datatable',
	standalone: true,
	imports: [
		HlmTableModule,
		HlmIconModule,
		CommonModule,
        OebButtonComponent,
		TranslateModule,
		RouterModule
        ],
    providers: [BadgeRequestApiService],    
	template: `
        <hlm-table class="tw-rounded-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightgray tw-border-darkgray tw-border">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="tw-bg-[var(--color-darkgray)] tw-text-white tw-flex-wrap hover:tw-bg-[var(--color-darkgray)]">
                <hlm-th class="!tw-text-white tw-w-28 md:tw-w-48">ID</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">{{'Badge.requestedOn' | translate}}</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let badge of requestedBadges" class="tw-bg-[var(--color-lightgray)] hover:tw-bg-[var(--color-lightgray)] tw-border-[var(--color-darkgray)] tw-flex-wrap tw-py-2">
                <hlm-th class="!tw-flex-1 !tw-text-oebblack"><p class="u-text">{{badge.email}}</p></hlm-th>
                <hlm-th class="tw-w-28 md:tw-w-48 tw-justify-center !tw-text-oebblack"> {{badge.requestedOn}}</hlm-th>
                <hlm-th class="tw-justify-center sm:tw-justify-end sm:tw-w-48 tw-w-full !tw-text-oebblack">
                    <oeb-button class="tw-w-full" variant="secondary" size="xs" width="full_width" [routerLink]="" (click)="actionElement.emit(badge.badge)" [text]="actionElementText"></oeb-button>
                </hlm-th>
            </hlm-trow>
        </hlm-table>`,
})
export class QrCodeDatatableComponent implements OnInit {
	@Input() caption: string = "";
    @Input() qrCodeId: string = "";
    @Input() routerLink: string[] = [];
    @Input() requestedBadges: any;
    @Input() actionElementText: string = "Badge vergeben"
    @Output() actionElement = new EventEmitter();
    @Output() redirectToBadgeDetail = new EventEmitter();

    constructor(private badgeRequestApiService: BadgeRequestApiService) {
    }

    ngOnInit(): void {
        this.badgeRequestApiService.getBadgeRequestsByQrCode(this.qrCodeId).then((requestedBadges: any) => {
            this.requestedBadges = requestedBadges.body.requested_badges
         })
        }
    }
