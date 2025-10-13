import { AfterViewInit, Component, inject, input, Input, output, TemplateRef, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DialogComponent } from '../../../components/dialog.component';
import { NgIcon } from '@ng-icons/core';
import { NgModel, FormsModule } from '@angular/forms';
import { Issuer, issuerStaffRoles } from '../../../issuer/models/issuer.model';
import { PublicApiService } from '../../../public/services/public-api.service';
import { MessageService } from '../../../common/services/message.service';
import { NgStyle } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormFieldSelectOption } from '../../../components/select.component';
import { NetworkApiService } from '../../../issuer/services/network-api.service';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { MemoizedProperty } from '~/common/util/memoized-property-decorator';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';

@Component({
	selector: 'add-institution',
	templateUrl: './add-institution.component.html',
	imports: [TranslatePipe, OebButtonComponent, NgIcon, HlmIcon, FormsModule, NgStyle],
})
export class AddInstitutionComponent implements AfterViewInit {
	constructor(
		private publicApiService: PublicApiService,
		private messageService: MessageService,
		private networkApiService: NetworkApiService,
	) {}

	network = input.required<any>();

	institutionsInvited = output();

	@ViewChild('inviteSuccessContent')
	inviteSuccessContent: TemplateRef<void>;

	@ViewChild('issuerSearchInputModel') issuerSearchInputModel: NgModel;

	private _networkStaffRoleOptions: FormFieldSelectOption[];

	dialogRef: BrnDialogRef<any> = null;

	issuerSearchQuery = '';
	selectedIssuers: Issuer[] = [];

	issuersShowResults = false;
	issuersLoading = false;
	issuerSearchLoaded = false;
	issuerSearchResults = [];

	rightsAndRolesExpanded = false;

	ngAfterViewInit() {
		this.issuerSearchInputModel.valueChanges
			.pipe(debounceTime(500))
			.pipe(distinctUntilChanged())
			.subscribe(() => {
				this.issuerSearchChange();
			});
	}

	issuerSearchInputFocusOut() {
		// delay hiding for click event
		setTimeout(() => {
			this.issuersShowResults = false;
		}, 200);
	}

	async issuerSearchChange() {
		if (this.issuerSearchQuery.length >= 3) {
			this.issuersLoading = true;
			try {
				this.issuerSearchResults = [];
				this.issuerSearchResults = await this.publicApiService.searchIssuers(this.issuerSearchQuery);
			} catch (error) {
				this.messageService.reportAndThrowError(`Failed to issuers: ${error.message}`, error);
			}
			this.issuersLoading = false;
			this.issuerSearchLoaded = true;
		}
	}

	calculateDropdownMaxHeight(el: HTMLElement, minHeight = 100) {
		const rect = el.getBoundingClientRect();
		let maxHeight = Math.ceil(window.innerHeight - rect.top - rect.height - 20);
		if (maxHeight < minHeight) {
			maxHeight = Math.ceil(rect.top - 20);
		}
		return maxHeight;
	}
	calculateDropdownBottom(el: HTMLElement, minHeight = 100) {
		const rect = el.getBoundingClientRect();
		const maxHeight = Math.ceil(window.innerHeight - rect.top - rect.height - 20);
		if (maxHeight < minHeight) {
			return rect.height + 2;
		}
		return null;
	}

	selectIssuerFromDropdown(issuer) {
		this.selectedIssuers.push(issuer);
	}

	removeSelectedissuer(issuer) {
		const index = this.selectedIssuers.indexOf(issuer);
		this.selectedIssuers.splice(index, 1);
	}

	collapseRoles() {
		this.rightsAndRolesExpanded = !this.rightsAndRolesExpanded;
	}

	@MemoizedProperty()
	get issuerStaffRoleOptions() {
		return issuerStaffRoles.map((r) => ({
			label: r.label,
			value: r.slug,
			description: r.description,
		}));
	}

	inviteInstitutions(issuers: Issuer[]) {
		if (!issuers.length) return;
		this.networkApiService.inviteInstitutions(this.network().slug, issuers).then((res) => {
			if (res) {
				this.openSuccessDialog();
				this.institutionsInvited.emit();
			}
		});
	}

	private readonly _hlmDialogService = inject(HlmDialogService);

	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				content: this.inviteSuccessContent,
				variant: 'success',
			},
		});

		this.dialogRef = dialogRef;
	}

	closeDialog() {
		this.dialogRef.close();
	}
}
