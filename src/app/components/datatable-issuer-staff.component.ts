import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { HlmPDirective } from '../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { Issuer, IssuerStaffMember, issuerStaffRoles } from '../issuer/models/issuer.model';
import { IssuerStaffRoleSlug } from '../issuer/models/issuer-api.model';
import { FormFieldSelectOption } from '../common/components/formfield-select';

@Component({
	selector: 'issuer-staff-datatable',
	standalone: true,
	imports: [HlmTableModule, HlmIconModule, CommonModule, TranslateModule, RouterModule, HlmPDirective],
	template: `
		<hlm-table
			class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-lightgrey tw-border"
		>
			<hlm-trow class="!tw-bg-lightgrey tw-text-oebblack tw-flex-wrap hover:tw-bg-lightgrey">
				<!-- Name -->
				<hlm-th class="tw-text-oebblack md:tw-w-[25%] tw-w-[33%] tw-px-4">Name</hlm-th>
				<!-- E-Mail -->
				<hlm-th class="tw-text-oebblack md:tw-w-[25%] tw-w-[33%] tw-px-4">E-Mail</hlm-th>
				<!-- Role -->
				<hlm-th class="tw-text-oebblack md:tw-w-[25%] tw-w-[33%] tw-px-4">Rolle</hlm-th>
				<!-- Actions -->
				<hlm-th class="tw-text-oebblack md:tw-w-[25%] tw-w-0 tw-px-4"></hlm-th>
			</hlm-trow>
			<hlm-trow *ngFor="let member of members" class="tw-border-lightgrey tw-flex-wrap tw-py-2">
				<hlm-th class="md:tw-w-[25%] tw-w-[33%] tw-px-4 tw-items-center ">
					<span class="tw-font-normal tw-text-lg tw-text-oebblack tw-truncate">{{ member.nameLabel }}</span>
				</hlm-th>
				<hlm-th class="md:tw-w-[25%] tw-w-[33%] tw-px-4 tw-text-center tw-flex tw-items-center"
					><p hlmP class="tw-font-normal tw-text-lg tw-text-oebblack tw-truncate">
						{{ member.email }}
					</p></hlm-th
				>
				<hlm-th class="tw-w-36 md:tw-w-48 !tw-text-oebblack sm:tw-grid">
					<div class="forminput forminput-full" *ngIf="isCurrentUserIssuerOwner">
						<div class="forminput-x-inputs">
							<select
								class="!tw-border-purple !tw-border-solid !tw-text-oebblack tw-rounded-[10px] tw-text-lg"
								[ngModel]="member.roleSlug"
								[disabled]="member == issuer.currentUserStaffMember"
								(change)="changeRole(member, $event.target.value)"
								*ngIf="isCurrentUserIssuerOwner"
							>
								<option *ngFor="let role of roleOptions" [value]="role.value">
									{{ role.label }}
								</option>
							</select>
						</div>
					</div>
				</hlm-th>
				<hlm-th class="md:tw-w-[25%] tw-w-full tw-px-4 tw-text-center tw-flex md:tw-justify-end">
					<span
						*ngIf="member != issuer.currentUserStaffMember"
						(click)="removeMember(member)"
						class="tw-text-link tw-underline tw-text-sm tw-cursor-pointer"
						>{{ 'General.remove' | translate }}</span
					>
				</hlm-th>
			</hlm-trow>
		</hlm-table>
	`,
})
export class IssuerStaffDatatableComponent {
	@Input() caption: string = '';
	@Input() members: IssuerStaffMember[];
	@Input() issuer: Issuer;
	@Input() isCurrentUserIssuerOwner: boolean;
	@Input() roleOptions: FormFieldSelectOption[];
	@Output() removeStaffMember = new EventEmitter();
	@Output() roleChanged = new EventEmitter<{ member: IssuerStaffMember; roleSlug: IssuerStaffRoleSlug }>();

	private _issuerStaffRoleOptions: FormFieldSelectOption[];

	// constructor(private cdr: ChangeDetectorRef) {}

	// ngOnChanges(changes: SimpleChanges) {
	// 	if (changes.members || changes.roleOptions) {
	// 		this.cdr.detectChanges();
	// 	}
	// }

	removeMember(member: IssuerStaffMember) {
		this.removeStaffMember.emit(member);
	}

	changeRole(member: IssuerStaffMember, roleSlug: IssuerStaffRoleSlug) {
		this.roleChanged.emit({ member, roleSlug });
	}

	memberId(member) {
		return member.email || member.url || member.telephone;
	}

	get issuerStaffRoleOptions() {
		return (
			this._issuerStaffRoleOptions ||
			(this._issuerStaffRoleOptions = issuerStaffRoles.map((r) => ({
				label: r.label,
				value: r.slug,
				description: r.description,
			})))
		);
	}
}
