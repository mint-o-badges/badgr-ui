import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { Issuer, IssuerStaffMember, issuerStaffRoles } from '../issuer/models/issuer.model';
import { IssuerStaffRoleSlug } from '../issuer/models/issuer-api.model';
import { FormFieldSelectOption } from '../common/components/formfield-select';
import { HlmIconModule } from '@spartan-ng/helm/icon';
import { FormsModule } from '@angular/forms';
import { HlmP } from '@spartan-ng/helm/typography';

@Component({
	selector: 'issuer-staff-datatable',
	standalone: true,
	imports: [...HlmTableImports, HlmIconModule, TranslateModule, RouterModule, HlmP, FormsModule],
	template: `
		<table
			hlmTable
			class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-lightgrey tw-border tw-border-solid"
		>
			<tr hlmTr class="!tw-bg-lightgrey tw-text-oebblack tw-flex-wrap hover:tw-bg-lightgrey">
				<!-- Name -->
				<th hlmTh class="tw-text-oebblack md:tw-w-[25%] tw-w-[33%] tw-px-4">Name</th>
				<!-- E-Mail -->
				<th hlmTh class="tw-text-oebblack md:tw-w-[25%] tw-w-[33%] tw-px-4">E-Mail</th>
				<!-- Role -->
				<th hlmTh class="tw-text-oebblack md:tw-w-[25%] tw-w-[33%] tw-px-4">Rolle</th>
				<!-- Actions -->
				<th hlmTh class="tw-text-oebblack md:tw-w-[25%] tw-w-0 tw-px-4"></th>
			</tr>
			@for (member of members; track member) {
				<tr hlmTr class="tw-border-lightgrey tw-flex-wrap tw-py-2">
					<th hlmTh class="md:tw-w-[25%] tw-w-[33%] tw-px-4 tw-items-center ">
						<span class="tw-font-normal tw-text-lg tw-text-oebblack tw-truncate">{{
							member.nameLabel
						}}</span>
					</th>
					<th hlmTh class="md:tw-w-[25%] tw-w-[33%] tw-px-4 tw-text-center tw-flex tw-items-center">
						<p hlmP class="tw-font-normal tw-text-lg tw-text-oebblack tw-truncate">
							{{ member.email }}
						</p>
					</th>
					<th hlmTh class="tw-w-36 md:tw-w-48 !tw-text-oebblack sm:tw-grid">
						@if (isCurrentUserIssuerOwner) {
							<div class="forminput forminput-full">
								<div class="forminput-x-inputs">
									@if (isCurrentUserIssuerOwner) {
										<select
											#memberSelect
											class="!tw-border-purple !tw-border-solid !tw-text-oebblack tw-rounded-[10px] tw-text-lg"
											[ngModel]="member.roleSlug"
											[disabled]="member == issuer.currentUserStaffMember"
											(change)="changeRole(member, $any(memberSelect.value))"
										>
											@for (role of roleOptions; track role) {
												<option [value]="role.value">
													{{ role.label }}
												</option>
											}
										</select>
									}
								</div>
							</div>
						}
					</th>
					<th hlmTh class="md:tw-w-[25%] tw-w-full tw-px-4 tw-text-center tw-flex md:tw-justify-end">
						@if (member != issuer.currentUserStaffMember) {
							<span
								(click)="removeMember(member)"
								class="tw-text-link tw-underline tw-text-sm tw-cursor-pointer"
								>{{ 'General.remove' | translate }}</span
							>
						}
					</th>
				</tr>
			}
		</table>
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
