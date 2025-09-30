import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Network } from '../../issuer/models/network.model';
import { HlmP } from '@spartan-ng/helm/typography';
import { NetworkV3 } from '~/issuer/models/networkv3.model';

@Component({
	selector: 'oeb-networkcard',
	host: {
		class: 'tw-rounded-[10px] tw-bg-purple tw-border-[#CFCECE] tw-border-solid tw-border tw-relative tw-p-3 tw-block tw-overflow-hidden tw-max-w-[600px]',
	},
	template: `
		<div class="tw-flex tw-flex-col tw-h-full">
			<div class="tw-flex-row tw-flex tw-items-center">
				<img [src]="network.image" class="tw-aspect-square" width="80" />
				<div class="tw-flex tw-flex-col tw-flex-wrap tw-pl-4 tw-py-2 tw-break-words">
					<a
						class="tw-text-3xl tw-font-bold"
						[routerLink]="['/issuer/networks', network.slug]"
						hlmP
						_variant="white"
						>{{ network.name }}</a
					>
					@if (!public) {
						<span class="tw-text-white tw-text-lg"
							>{{
								'Network.yourRole'
									| translate
										: {
												role:
													'Network.role.' + $any(network).currentUserStaffMember.roleSlug
													| translate,
										  }
							}}
						</span>
					}
				</div>
			</div>
			<div class="tw-text-white">
				{{ network.description }}
			</div>
		</div>
	`,
	imports: [HlmP, RouterLink, TranslatePipe],
})
export class OebNetworkCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	@Input() network: Network | NetworkV3;
	@Input() public = true;
}
