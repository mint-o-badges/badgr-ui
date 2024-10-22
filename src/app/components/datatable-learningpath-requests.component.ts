import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';

@Component({
	selector: 'learningpath-requests-datatable',
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
    <hlm-table
        class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-darkgrey tw-border-[1px] tw-border-solid tw-mt-8"
            >
        <hlm-caption>{{ caption }}</hlm-caption>
        <hlm-trow class="tw-bg-darkgrey tw-text-white tw-flex-wrap hover:!tw-bg-darkgrey">
            <hlm-th class="!tw-text-white tw-w-40">ID</hlm-th>
            <hlm-th class="!tw-text-white tw-justify-center xl:tw-pr-12 !tw-flex-1">Angefragt am </hlm-th>
            <hlm-th class="!tw-text-white tw-justify-end xl:tw-w-40 tw-w-0 !tw-p-0"></hlm-th>
        </hlm-trow>
        <hlm-trow
            *ngFor="let request of requests; let i = index"
            class="tw-border-purple tw-border-0 tw-border-solid tw-flex-wrap tw-items-center tw-py-2 tw-relative"
        >

            <hlm-th class="tw-w-40">
                <span class="!tw-text-oebblack !tw-font-normal">{{ request.user.email }}</span>
            </hlm-th>
            <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-purple"><p class="u-text">{{request.requestedOn | date:"dd.MM.yyyy"}}</p></hlm-th>

            <hlm-th
                class="tw-justify-center sm:tw-justify-end sm:tw-w-48 tw-w-full !tw-text-oebblack"
            >
                <oeb-button
                    size="xs"
                    width="full_width"
                    class="tw-w-full"
                    (click)="actionElement.emit(request)"
                    [text]="actionElementText"
                    [disabled]="!!loading"
                    [loading-promises]="[loading]" loading-message="Badge vergeben..."
                ></oeb-button>
                    </hlm-th>
                </hlm-trow>
            </hlm-table>
        `,
})
export class LearningPathRequestsDatatableComponent {
	@Input() caption: string = "";
    @Input() requests: any[];
    @Input() loading;
    @Input() actionElementText: string = "Badge vergeben"
    @Output() actionElement = new EventEmitter();
}
