import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { Issuer } from '../issuer/models/issuer.model';

@Component({
    selector: 'learningpaths-datatable',
    imports: [HlmTableModule, HlmIconModule, CommonModule, OebButtonComponent, TranslateModule, RouterModule],
    template: ` <hlm-table
		class="tw-rounded-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border"
	>
		<hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
			<hlm-th class="!tw-text-white tw-w-28 sm:tw-w-20 md:tw-w-40">Lernpfad</hlm-th>
			<hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">{{ 'Badge.createdOn' | translate }}</hlm-th>
			<hlm-th class="!tw-text-white tw-w-36 md:tw-w-40">{{
				'Issuer.learningPathParticipants' | translate
			}}</hlm-th>
			<hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
		</hlm-trow>
		<hlm-trow *ngFor="let learningPath of learningPaths" class="tw-border-purple tw-flex-wrap tw-py-2">
			<hlm-th
				class="tw-w-28 md:tw-flex-row tw-flex-col md:tw-w-48 tw-cursor-pointer tw-items-baseline tw-gap-1 md:tw-gap-2 md:tw-items-center"
				(click)="redirectToLearningPathDetail.emit(learningPath.slug)"
			>
				<img
					class="l-flex-x-shrink0 badgeimage badgeimage-small"
					width="40"
					height="40"
					src="{{ learningPath.participationBadge_image }}"
				/>
				<div
					class="md:tw-grid md:tw-grid-cols-[150px] lg:tw-grid-cols-[250px] xl:tw-grid-cols-[350px] tw-my-3 md:tw-my-2"
				>
					<div
						class="tw-text-nowrap md:tw-text-wrap md:tw-line-clamp-3 tw-break-word  tw-max-w-36 md:tw-max-w-none tw-absolute md:tw-relative"
					>
						<span
							class="tw-text-oebblack tw-cursor-pointer"
							(click)="redirectToLearningPathDetail.emit(learningPath.slug)"
							>{{ learningPath.name }}</span
						>
					</div>
				</div>
			</hlm-th>
			<hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"
				><p class="u-text">{{ learningPath.created_at | date: 'dd.MM.yyyy' }}</p></hlm-th
			>
			<hlm-th class="tw-w-36 md:tw-w-40 tw-justify-center !tw-text-oebblack">{{
				learningPath.participant_count
			}}</hlm-th>
			<hlm-th class="tw-justify-center sm:tw-justify-end sm:tw-w-48 tw-w-full !tw-text-oebblack">
				<oeb-button
					class="tw-w-full"
					variant="secondary"
					size="xs"
					width="full_width"
					(click)="actionElement.emit(learningPath.slug)"
					[text]="actionElementText"
					[disabled]="!issuer.canCreateBadge"
					[class]="issuer.canCreateBadge ? '' : 'disabled'"
				></oeb-button>
			</hlm-th>
		</hlm-trow>
	</hlm-table>`
})
export class LearningPathDatatableComponent {
	@Input() learningPaths: any[];
	@Input() actionElementText: string = 'Löschen';
	@Input() issuer: Issuer;
	@Output() actionElement = new EventEmitter();
	@Output() redirectToLearningPathDetail = new EventEmitter();

}
