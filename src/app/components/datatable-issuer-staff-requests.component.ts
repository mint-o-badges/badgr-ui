import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { HlmPDirective } from '../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { ApiStaffRequest } from '../issuer/staffrequest-api.model';

@Component({
	selector: 'issuer-staff-requests-datatable',
	standalone: true,
	imports: [
		HlmTableModule,
		HlmIconModule,
		CommonModule,
		OebButtonComponent,
		TranslateModule,
		RouterModule,
		HlmPDirective,
	],
	template: `
		<hlm-table
			*ngIf="requests.length > 0"
			class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-lightgrey tw-border"
		>
			<hlm-trow class="!tw-bg-lightgreen tw-text-oebblack tw-flex-wrap hover:tw-bg-lightgreen">
				<!-- Name -->
				<hlm-th class="tw-text-oebblack tw-text-lg tw-w-[25%] tw-px-4">Name</hlm-th>
				<!-- E-Mail -->
				<hlm-th class="tw-text-oebblack tw-w-[25%] tw-text-lg tw-px-4 tw-text-center">E-Mail</hlm-th>
				<!-- Requested On -->
				<hlm-th class="tw-text-oebblack tw-w-[25%] tw-text-lg tw-px-4 tw-text-center">{{
					'Badge.requestedOn' | translate
				}}</hlm-th>
				<!-- Actions -->
				<hlm-th class="tw-w-[25%] tw-px-4"></hlm-th>
			</hlm-trow>
			<hlm-trow *ngFor="let request of requests" class="tw-border-purple tw-flex-wrap tw-py-2">
				<!-- Name Column -->
				<hlm-th class="tw-w-[25%] tw-px-4 tw-flex tw-items-center">
					<span class="tw-text-oebblack tw-cursor-pointer tw-truncate tw-font-normal tw-text-lg">
						{{ request.user.first_name }} {{ request.user.last_name }}
					</span>
				</hlm-th>

				<!-- Email Column -->
				<hlm-th class="tw-w-[25%] tw-px-4 tw-text-center tw-flex tw-items-center">
					<p class="tw-font-normal tw-truncate tw-text-lg tw-text-oebblack">{{ request.user.email }}</p>
				</hlm-th>

				<!-- Requested On Column -->
				<hlm-th class="tw-w-[25%] tw-px-4 tw-text-center tw-flex tw-items-center">
					<span class="tw-font-normal tw-text-lg tw-text-oebblack">{{
						request.requestedOn | date: 'dd.MM.yyyy'
					}}</span>
				</hlm-th>

				<!-- Actions Column -->
				<hlm-th class="tw-w-[25%] tw-px-4 tw-flex tw-items-center tw-gap-2">
					<oeb-button
						(click)="confirmRequest(request)"
						size="sm"
						[text]="'General.confirm' | translate"
					></oeb-button>
					<span
						(click)="deleteRequest(request.entity_id)"
						class="tw-text-link tw-underline tw-text-sm tw-cursor-pointer"
					>
						{{ 'Issuer.deleteStaffRequest' | translate }}
					</span>
				</hlm-th>
			</hlm-trow>
		</hlm-table>
	`,
})
export class IssuerStaffRequestsDatatableComponent {
	@Input() caption: string = '';
	@Input() requests: ApiStaffRequest[] = [];
	@Output() deleteStaffRequest = new EventEmitter<string>();
	@Output() confirmStaffRequest = new EventEmitter<ApiStaffRequest>();

	deleteRequest(requestId: string) {
		this.deleteStaffRequest.emit(requestId);
	}

	confirmRequest(request: ApiStaffRequest) {
		this.confirmStaffRequest.emit(request);
	}
}
