import {
	OnInit,
	AfterViewInit,
	Component,
	input,
	OnDestroy,
	output,
	TemplateRef,
	ViewChild,
	inject,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { NgIcon } from '@ng-icons/core';
import { NgModel, FormsModule, FormControl } from '@angular/forms';
import { Issuer } from '../../../issuer/models/issuer.model';
import { PublicApiService } from '../../../public/services/public-api.service';
import { MessageService } from '../../../common/services/message.service';
import { NgStyle } from '@angular/common';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormFieldSelectOption, OebSelectComponent } from '../../../components/select.component';
import { NetworkApiService } from '../../../issuer/services/network-api.service';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { Network } from '~/issuer/network.model';
import { BadgeClassApiService } from '~/issuer/services/badgeclass-api.service';
import { BadgeClass } from '~/issuer/models/badgeclass.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { PublicApiIssuer } from '~/public/models/public-api.model';

@Component({
	selector: 'select-network',
	templateUrl: './select-network.component.html',
	imports: [TranslatePipe, OebButtonComponent, NgIcon, HlmIcon, FormsModule, NgStyle, OebSelectComponent],
})
export class SelectNetworkComponent implements OnInit {
	private publicApiService = inject(PublicApiService);
	private messageService = inject(MessageService);
	private badgeClassApiService = inject(BadgeClassApiService);
	private router = inject(Router);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	issuer = input.required<Issuer | Network>();
	badge = input.required<BadgeClass>();

	closeSelect = output();

	networkSelected = output();

	@ViewChild('inviteSuccessContent')
	inviteSuccessContent: TemplateRef<void>;

	@ViewChild('networkSearchInputModel') networkSearchInputModel: NgModel;

	dialogRef: BrnDialogRef<any> = null;

	networkSearchQuery = '';
	selectedNetwork: PublicApiIssuer = null;

	networksShowResults = false;
	networksLoading = false;
	networkSearchLoaded = false;
	networkSearchResults = [];

	issuerNetworks: PublicApiIssuer[];

	rightsAndRolesExpanded = false;

	networkControl = new FormControl();

	networkOptions: FormFieldSelectOption[];

	ngOnInit() {
		this.publicApiService.getIssuerNetworks(this.issuer().slug).then((networks) => {
			this.issuerNetworks = networks;
			this.networkOptions = networks.map((n) => ({
				label: n.name,
				value: n.name,
			}));
		});

		this.networkControl.valueChanges.subscribe((value: string) => {
			const selected = this.issuerNetworks.find((n) => n.name == value);
			this.selectedNetwork = selected;
		});
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
