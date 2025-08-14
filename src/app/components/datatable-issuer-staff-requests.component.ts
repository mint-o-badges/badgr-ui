import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { ApiStaffRequest } from '../issuer/staffrequest-api.model';
import { HlmIconModule } from '@spartan-ng/helm/icon';

@Component({
	selector: 'issuer-staff-requests-datatable',
	standalone: true,
	imports: [...HlmTableImports, HlmIconModule, CommonModule, OebButtonComponent, TranslateModule, RouterModule],
	template: `
		@if (requests.length > 0) {
			<table
				hlmTable
				class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-lightgrey tw-border tw-border-solid"
			>
				<tr hlmTr class="!tw-bg-lightgreen tw-text-oebblack tw-flex-wrap hover:tw-bg-lightgreen">
					<!-- Name -->
					<th hlmTh class="tw-text-oebblack tw-text-lg md:tw-w-[25%] tw-w-[33%] tw-px-4">Name</th>
					<!-- E-Mail -->
					<th hlmTh class="tw-text-oebblack md:tw-w-[25%] tw-w-[33%] tw-text-lg tw-px-4 tw-text-center">
						E-Mail
					</th>
					<!-- Requested On -->
					<th hlmTh class="tw-text-oebblack md:tw-w-[25%]tw-w-[33%] tw-text-lg tw-px-4 tw-text-center">
						{{ 'Badge.requestedOn' | translate }}
					</th>
					<!-- Actions -->
					<th hlmTh class="md:tw-w-[25%] tw-w-0 tw-px-4"></th>
				</tr>
				@for (request of requests; track request) {
					<tr hlmTr class="tw-border-purple tw-flex-wrap tw-py-2">
						<!-- Name Column -->
						<th hlmTh class="md:tw-w-[25%] tw-w-[33%] tw-px-4 tw-flex tw-items-center">
							<span class="tw-text-oebblack tw-cursor-pointer tw-truncate tw-font-normal tw-text-lg">
								{{ request.user.first_name }} {{ request.user.last_name }}
							</span>
						</th>
						<!-- Email Column -->
						<th hlmTh class="md:tw-w-[25%] tw-w-[33%] tw-px-4 tw-text-center tw-flex tw-items-center">
							<p class="tw-font-normal tw-truncate tw-text-lg tw-text-oebblack">
								{{ request.user.email }}
							</p>
						</th>
						<!-- Requested On Column -->
						<th hlmTh class="md:tw-w-[25%] tw-w-[33%] tw-px-4 tw-text-center tw-flex tw-items-center">
							<span class="tw-font-normal tw-text-lg tw-text-oebblack">{{
								request.requestedOn | date: 'dd.MM.yyyy'
							}}</span>
						</th>
						<!-- Actions Column -->
						<th
							hlmTh
							class="md:tw-w-[25%] tw-w-full tw-px-4 tw-flex tw-flex-row md:tw-flex-col lg:tw-h-fit tw-h-16 lg:tw-flex-row tw-justify-evenly tw-items-start md:tw-items-center xl:tw-gap-6 tw-gap-2"
						>
							<oeb-button
								(click)="confirmRequest(request)"
								size="sm"
								[text]="'General.confirm' | translate"
								class="tw-mb-2 md:tw-mb-0"
							></oeb-button>
							<span
								(click)="deleteRequest(request.entity_id)"
								class="tw-text-link tw-underline tw-text-sm tw-cursor-pointer"
							>
								{{ 'Issuer.deleteStaffRequest' | translate }}
							</span>
						</th>
					</tr>
				}
			</table>
		}
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
