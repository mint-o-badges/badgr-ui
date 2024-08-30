import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';

@Component({
	selector: 'learningpath-graduates-datatable',
	standalone: true,
	imports: [
		HlmTableModule,
		HlmIconModule,
		CommonModule,
        OebButtonComponent,
		TranslateModule,
		RouterModule
        ],
	template: `
        <hlm-table class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
                <hlm-th class="!tw-text-white tw-w-28 md:tw-w-48">ID</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">Abgeschlossen am</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let participant of participants" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-28 md:tw-w-48">
                    <span class="tw-text-oebblack tw-cursor-pointer">{{participant.user.email}}</span>
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"><p class="u-text">{{participant.completed_at | date:"dd.MM.yyyy"}}</p></hlm-th>
                <hlm-th class="tw-justify-center sm:tw-justify-end sm:tw-w-48 tw-w-full !tw-text-oebblack tw-flex tw-flex-col">
                    <oeb-button class="tw-w-full" variant="secondary" size="xs" width="full_width" (click)="actionElement.emit(participant)" [text]="actionElementText"></oeb-button>
                </hlm-th>
            </hlm-trow>
        </hlm-table>`,
})
export class LearningPathGraduatesDatatableComponent {
	@Input() caption: string = "";
    @Input() participants: any[];
    @Input() actionElementText: string = "PDF-Zertifikat"
    @Output() actionElement = new EventEmitter();
    @Output() redirectToBadgeDetail = new EventEmitter();
}
