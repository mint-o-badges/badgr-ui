import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '~/components/oeb-button.component';
import { NetworkV3 } from '~/issuer/models/networkv3.model';
import { Network } from '~/issuer/network.model';

@Component({
	selector: 'oeb-networkcard',
	host: {
		class: 'tw-rounded-[10px] tw-bg-purple tw-border-[#CFCECE] tw-border-solid tw-border tw-relative tw-p-6 tw-block tw-overflow-hidden tw-max-w-[600px] tw-h-[455px] tw-cursor-pointer',
	},
	template: `
		<div class="tw-flex tw-flex-col tw-h-full">
			<div class="tw-flex-row tw-flex tw-items-center">
				<div
					class="tw-bg-white tw-w-[100px] tw-h-[100px] tw-flex tw-flex-shrink-0 tw-items-center tw-justify-center tw-rounded-[10px]"
				>
					<img [src]="network.image" class="tw-aspect-square" width="80" />
				</div>
				<div class="tw-flex tw-flex-col tw-flex-wrap tw-pl-4 tw-py-2 tw-break-words">
					<div class="!tw-text-3xl tw-font-bold tw-leading-[120%] tw-text-white">{{ network.name }}</div>
					@if (!public) {
						<span class="tw-text-white tw-text-lg"
							>{{
								'Network.yourRole'
									| translate
										: {
												role: 'Network.role.' + network.current_user_network_role | translate,
										  }
							}}
						</span>
					}
				</div>
			</div>
			<div class="tw-text-white tw-mt-4 tw-leading-[130%]">
				{{ network.description }}
			</div>
			@if (!public) {
				<section class="tw-flex tw-flex-col tw-h-full">
					<div class="tw-mt-auto tw-flex tw-flex-col tw-gap-6">
						@if (network.current_user_network_role && network.current_user_network_role != 'staff') {
							<oeb-button
								variant="secondary"
								width="full_width"
								weight="medium"
								[text]="'Issuer.createBadge' | translate"
								[routerLink]="['/issuer/networks', network.slug]"
								[queryParams]="{ tab: 'badges' }"
							></oeb-button>
						}
						<oeb-button
							variant="secondary"
							width="full_width"
							[text]="'Issuer.giveBadge' | translate"
							[routerLink]="['/issuer/networks', network.slug]"
							[queryParams]="{ tab: 'badges' }"
						></oeb-button>
					</div>
				</section>
			}
		</div>
	`,
	imports: [RouterLink, TranslatePipe, OebButtonComponent],
})
export class OebNetworkCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	@Input() network: Network | NetworkV3;
	@Input() public = true;
}
