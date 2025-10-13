import { AfterViewInit, Component, input, output, TemplateRef, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { NgIcon } from '@ng-icons/core';
import { NgModel, FormsModule } from '@angular/forms';
import { Issuer } from '../../../issuer/models/issuer.model';
import { PublicApiService } from '../../../public/services/public-api.service';
import { MessageService } from '../../../common/services/message.service';
import { NgStyle } from '@angular/common';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormFieldSelectOption } from '../../../components/select.component';
import { NetworkApiService } from '../../../issuer/services/network-api.service';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { Network } from '~/issuer/network.model';
import { BadgeClassApiService } from '~/issuer/services/badgeclass-api.service';
import { BadgeClass } from '~/issuer/models/badgeclass.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
	selector: 'select-network',
	templateUrl: './select-network.component.html',
	imports: [TranslatePipe, OebButtonComponent, NgIcon, HlmIcon, FormsModule, NgStyle],
})
export class SelectNetworkComponent implements AfterViewInit {
	constructor(
		private publicApiService: PublicApiService,
		private messageService: MessageService,
		private networkApiService: NetworkApiService,
		private badgeClassApiService: BadgeClassApiService,
		private router: Router,
	) {}

	issuer = input.required<Issuer | Network>();
	badge = input.required<BadgeClass>();

	closeSelect = output();

	networkSelected = output();

	private destroy$ = new Subject<void>();

	@ViewChild('inviteSuccessContent')
	inviteSuccessContent: TemplateRef<void>;

	@ViewChild('networkSearchInputModel') networkSearchInputModel: NgModel;

	private _networkStaffRoleOptions: FormFieldSelectOption[];

	dialogRef: BrnDialogRef<any> = null;

	networkSearchQuery = '';
	selectedNetwork: Network = null;

	networksShowResults = false;
	networksLoading = false;
	networkSearchLoaded = false;
	networkSearchResults = [];

	rightsAndRolesExpanded = false;

	ngAfterViewInit() {
		this.networkSearchInputModel.valueChanges
			.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
			.subscribe(() => this.networkSearchChange());
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	networkSearchInputFocusOut() {
		// delay hiding for click event
		setTimeout(() => {
			this.networksShowResults = false;
		}, 200);
	}

	async networkSearchChange() {
		if (this.networkSearchQuery.length >= 3) {
			this.networksLoading = true;
			try {
				this.networkSearchResults = [];
				this.networkSearchResults = (await this.publicApiService.searchIssuers(this.networkSearchQuery)).filter(
					(i) => i.is_network,
				);
			} catch (error) {
				this.messageService.reportAndThrowError(`Failed to networks: ${error.message}`, error);
			}
			this.networksLoading = false;
			this.networkSearchLoaded = true;
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

	selectNetworkFromDropdown(network) {
		this.networkSearchQuery = network.name;
		this.selectedNetwork = network;
	}

	removeSelectednetwork() {
		this.selectedNetwork = null;
	}

	shareBadge() {
		try {
			this.badgeClassApiService.shareOnNetwork(this.selectedNetwork.slug, this.badge().slug).then((s) => {
				this.closeSelect.emit();
				this.router.navigate(['/issuer/networks/', this.selectedNetwork.slug], {
					queryParams: { tab: 'badges', innerTab: 'partner' },
				});
			});
		} catch (e) {
			this.messageService.reportAndThrowError(e);
		}
	}
}
