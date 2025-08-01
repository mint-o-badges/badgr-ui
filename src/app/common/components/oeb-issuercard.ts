import { Component, Input } from '@angular/core';
import { Issuer } from '../../issuer/models/issuer.model';
import { HlmPDirective } from '../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { RouterLink } from '@angular/router';
import { PublicApiIssuer } from '../../public/models/public-api.model';

@Component({
	selector: 'oeb-issuerCard',
	host: {
		class: 'tw-rounded-[10px] tw-bg-white tw-border-[#CFCECE] tw-border-solid tw-border tw-relative tw-p-3 tw-block tw-overflow-hidden',
	},
	template: `
		<div class="tw-flex tw-flex-col tw-h-full">
			<div class="tw-flex-row tw-flex tw-items-center">
				<img [src]="issuer.image" class="tw-aspect-square" width="80" />
				<div class="tw-flex tw-flex-col tw-flex-wrap tw-pl-4 tw-py-2 tw-break-words">
					<a [routerLink]="['/public/issuers', issuer.slug]" hlmP>{{ issuer.name }}</a>
					<p class="tw-font-bold" hlmP size="sm">{{ issuer.email }}</p>
				</div>
			</div>
			<div>
				{{ issuer.description }}
			</div>
		</div>
	`,
	imports: [HlmPDirective, RouterLink],
})
export class OebIssuerCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	@Input() issuer: Issuer | PublicApiIssuer;
}
