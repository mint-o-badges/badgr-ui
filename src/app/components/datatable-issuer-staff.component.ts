import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { HlmPDirective } from '../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { FormControl } from '@angular/forms';
import { OebSelectComponent } from './select.component';
import { IssuerStaffMember } from '../issuer/models/issuer.model';

@Component({
	selector: 'issuer-staff-datatable',
	standalone: true,
	imports: [
		HlmTableModule,
		HlmIconModule,
		CommonModule,
		OebButtonComponent,
		OebSelectComponent,
		TranslateModule,
		RouterModule,
		HlmPDirective,
	],
	template: ` <hlm-table
		class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-lightgrey tw-border"
	>
		<hlm-trow class="!tw-bg-lightgrey tw-text-oebblack tw-flex-wrap hover:tw-bg-lightgrey">
			<!-- Name -->
			<hlm-th class="tw-text-oebblack tw-w-[25%] tw-px-4">Name</hlm-th>
			<!-- E-Mail -->
			<hlm-th class="tw-text-oebblack tw-w-[25%] tw-px-4">E-Mail</hlm-th>
			<!-- Role -->
			<hlm-th class="tw-text-oebblack tw-w-[25%] tw-px-4">Rolle</hlm-th>
			<!-- Actions -->
			<hlm-th class="tw-text-oebblack tw-w-[25%] tw-px-4"></hlm-th>
		</hlm-trow>
		<hlm-trow *ngFor="let member of members" class="tw-border-lightgrey tw-flex-wrap tw-py-2">
			<hlm-th class="tw-w-[25%] tw-px-4 tw-items-center ">
				<span class="tw-font-normal tw-text-lg tw-text-oebblack tw-truncate">{{ member.nameLabel }}</span>
			</hlm-th>
			<hlm-th class="tw-w-[25%] tw-px-4 tw-text-center tw-flex tw-items-center"
				><p hlmP class="tw-font-normal tw-text-lg tw-text-oebblack">{{ member.email }}</p></hlm-th
			>
			<hlm-th class="tw-w-36 md:tw-w-40 tw-justify-center !tw-text-oebblack sm:tw-grid">
				<oeb-select
					actionBar="true"
					[placeholder]="member.roleInfo.label"
					class="oeb tw-w-[12rem]"
					[options]="roleOptions"
					[control]="roleControl"
					[autofocus]="true"
					noTopMargin="true"
				></oeb-select>
			</hlm-th>
			<hlm-th class="tw-w-[25%] tw-px-4 tw-text-center tw-flex tw-justify-end">
				<span (click)="removeMember(member)" class="tw-text-link tw-underline tw-text-sm tw-cursor-pointer">{{
					'General.remove' | translate
				}}</span>
			</hlm-th>
		</hlm-trow>
	</hlm-table>`,
})
export class IssuerStaffDatatableComponent {
	@Input() caption: string = '';
	@Input() members: IssuerStaffMember[];
	@Input() roleOptions: any[];
	@Output() removeStaffMember = new EventEmitter();

	roleControl = new FormControl('');

	ngOnInit() {
		console.log(this.roleOptions);
	}

	removeMember(member: IssuerStaffMember) {
		this.removeStaffMember.emit(member);
	}
}
