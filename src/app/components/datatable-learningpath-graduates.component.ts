import { NgIcon } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';

@Component({
	selector: 'learningpath-graduates-datatable',
	imports: [HlmTableModule, NgIcon, HlmIconModule, CommonModule, OebButtonComponent, TranslateModule, RouterModule],
	template: ` <hlm-table
		class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border"
	>
		<hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
			<hlm-th class="!tw-text-white tw-w-28 md:tw-w-48">ID</hlm-th>
			<hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">Abgeschlossen am</hlm-th>
			<hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
		</hlm-trow>
		<hlm-trow *ngFor="let participant of participants" class="tw-border-purple tw-flex-wrap tw-py-2">
			<hlm-th class="tw-w-28 md:tw-w-48">
				<span class="tw-text-oebblack tw-cursor-pointer">{{ participant.user.email }}</span>
			</hlm-th>
			<hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"
				><p class="u-text">{{ participant.completed_at | date: 'dd.MM.yyyy' }}</p></hlm-th
			>
			<hlm-th
				class="tw-justify-center sm:tw-justify-end !tw-text-oebblack tw-flex-col tw-h-fit sm:tw-w-max tw-w-full tw-gap-2 tw-my-2 tw-mt-7 sm:tw-mt-2"
			>
				<oeb-button
					class="tw-w-full"
					variant="secondary"
					size="xs"
					width="full_width"
					(click)="revokeLearningPath.emit(participant)"
					[text]="revokeLpText"
				></oeb-button>
				<oeb-button
					class="tw-w-full"
					size="xs"
					width="full_width"
					(click)="downloadCertificate.emit(participant)"
					[text]="actionElementText"
				></oeb-button>
			</hlm-th>
		</hlm-trow>
	</hlm-table>`,
})
export class LearningPathGraduatesDatatableComponent {
	@Input() caption: string = '';
	@Input() participants: any[];
	@Input() actionElementText: string = 'PDF-Zertifikat';
	@Input() revokeLpText: string = 'zurücknehmen';
	@Output() revokeLearningPath = new EventEmitter();
	@Output() downloadCertificate = new EventEmitter();
	@Output() redirectToBadgeDetail = new EventEmitter();
}
