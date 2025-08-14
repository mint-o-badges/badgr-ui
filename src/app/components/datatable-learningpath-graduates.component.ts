import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { HlmIconModule } from '@spartan-ng/helm/icon';

@Component({
	selector: 'learningpath-graduates-datatable',
	imports: [...HlmTableImports, HlmIconModule, CommonModule, OebButtonComponent, TranslateModule, RouterModule],
	template: ` <table
		hlmTable
		class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border tw-border-solid"
	>
		<tr hlmTr class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
			<th hlmTh class="!tw-text-white tw-w-28 md:tw-w-48">ID</th>
			<th hlmTh class="!tw-text-white tw-justify-center !tw-flex-1">
				{{ 'LearningPath.finishedOn' | translate }}
			</th>
			<th hlmTh class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></th>
		</tr>
		@for (participant of participants; track participant) {
			<tr hlmTr class="tw-border-purple tw-flex-wrap tw-py-2">
				<th hlmTh class="tw-w-28 md:tw-w-48">
					<span class="tw-text-oebblack tw-cursor-pointer">{{ participant.user.email }}</span>
				</th>
				<th hlmTh class="!tw-flex-1 tw-justify-center !tw-text-oebblack">
					<p class="u-text">{{ participant.completed_at | date: 'dd.MM.yyyy' }}</p>
				</th>
				<th
					hlmTh
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
				</th>
			</tr>
		}
	</table>`,
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
