import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { ApiLearningPathRequest } from '../common/model/learningpath-api.model';

@Component({
    selector: 'learningpath-requests-datatable',
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
            [ngClass]="requests.length > 0 ? 'tw-border-green' : 'tw-border-darkgrey'"
            class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-[1px] tw-border-solid">
            <hlm-trow 
                [ngClass]="requests.length > 0 ? 'tw-bg-green hover:!tw-bg-green tw-text-purple' : 'tw-bg-darkgrey tw-text-white'"
                class="tw-bg-darkgrey tw-flex-wrap hover:!tw-bg-darkgrey">
                <hlm-th [ngClass]="requests.length > 0 ? '!tw-text-purple' : '!tw-text-white'" class="tw-w-40 tw-font-medium">ID</hlm-th>
                <hlm-th [ngClass]="requests.length > 0 ? '!tw-text-purple' : '!tw-text-white'" class="tw-justify-center tw-font-medium xl:tw-pr-12 !tw-flex-1">Angefragt am </hlm-th>
                <hlm-th [ngClass]="requests.length > 0 ? '!tw-text-purple' : '!tw-text-white'" class="tw-justify-end tw-font-medium xl:tw-w-40 tw-w-0 !tw-p-0"></hlm-th>
            </hlm-trow>
            <hlm-trow
                *ngFor="let request of requests; let i = index"
                class="tw-border-purple tw-border-0 tw-border-solid tw-flex-wrap tw-items-center tw-py-2 tw-relative">
                <hlm-th class="tw-w-40">
                    <span class="!tw-text-oebblack !tw-font-normal">{{ request.user.email }}</span>
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-purple"><p class="u-text">{{request.requestedOn | date:"dd.MM.yyyy"}}</p></hlm-th>

                <hlm-th class="tw-justify-center sm:tw-justify-end sm:tw-w-48 tw-w-full !tw-text-oebblack">
                    <oeb-button
                        size="xs"
                        width="full_width"
                        class="tw-w-full"
                        variant="green"
                        (click)="actionElement.emit(request)"
                        [text]="actionElementText"
                        [disabled]="!!loading"
                        [loading-promises]="[loading]" loading-message="Badge vergeben..."
                    ></oeb-button>
                </hlm-th>
            </hlm-trow>
        </hlm-table>
        `
})
export class LearningPathRequestsDatatableComponent {
	@Input() caption: string = "";
    @Input() requests: ApiLearningPathRequest[];
    @Input() loading;
    @Input() actionElementText: string = "Badge vergeben"
    @Output() actionElement = new EventEmitter();
}
