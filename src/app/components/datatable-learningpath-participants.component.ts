import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { HlmIconModule } from '@spartan-ng/helm/icon';

@Component({
	selector: 'learningpath-participants-datatable',
	imports: [HlmTableModule, HlmIconModule, CommonModule, TranslateModule, RouterModule],
	template: ` <table
		hlmTable
		class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-purple tw-border"
	>
		<tr
			hlmTr
			class="tw-bg-darkgrey tw-text-white tw-flex-wrap hover:!tw-bg-darkgrey tw-justify-between md:tw-justify-normal"
		>
			<th hlmTh class="!tw-text-white tw-w-28 md:tw-w-48">ID</th>
			<th hlmTh class="!tw-text-white tw-justify-center tw-hidden md:tw-flex !tw-flex-1">Begonnen am</th>
			<th hlmTh class="!tw-text-white tw-justify-end tw-w-40 md:!tw-flex !tw-block tw-text-right md:tw-text-left">
				<p class="tw-whitespace-nowrap md:tw-hidden">Begonnen am</p>
				<p>Status</p>
			</th>
		</tr>
		@for (participant of participants; track participant) {
			<tr hlmTr class="tw-border-purple tw-flex-wrap tw-justify-between md:tw-justify-normal tw-py-2">
				<th hlmTh class="tw-w-28 md:tw-w-48">
					<span class="tw-text-oebblack tw-cursor-pointer">{{ participant.user.email }}</span>
				</th>
				<th hlmTh class="tw-hidden md:tw-flex !tw-flex-1 tw-justify-center !tw-text-oebblack">
					<p class="u-text">{{ participant.started_at | date: 'dd.MM.yyyy' }}</p>
				</th>
				<th hlmTh class="tw-justify-center sm:tw-justify-end tw-w-40 !tw-text-oebblack tw-flex-col">
					<p class="md:tw-hidden">{{ participant.started_at | date: 'dd.MM.yyyy' }}</p>
					<p class="tw-whitespace-nowrap">
						{{ participant.completed_badges.length }} / {{ number_badges }} Badges
					</p>
				</th>
			</tr>
		}
	</table>`,
})
export class LearningPathParticipantsDatatableComponent {
	@Input() caption: string = '';
	@Input() participants: any[];
	@Input() actionElementText: string = 'PDF-Zertifikat';
	@Input() number_badges: number = 0;
	@Output() actionElement = new EventEmitter();
	@Output() redirectToBadgeDetail = new EventEmitter();
}
