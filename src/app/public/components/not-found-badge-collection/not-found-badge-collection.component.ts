import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleX } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmIcon } from '@spartan-ng/helm/icon';

@Component({
	selector: 'bg-not-found-collection',
	imports: [HlmIcon, NgIcon, TranslatePipe],
	providers: [provideIcons({ lucideCircleX })],
	template: `<div class="page-padding oeb">
		<div class="tw-bg-lightpurple oeb-inset-padding tw-flex tw-justify-center">
			<section
				class="tw-border-solid tw-border-purple tw-border-2 tw-rounded-[10px] tw-bg-background tw-py-4 tw-px-16 tw-my-16 tw-inline-block tw-text-center"
			>
				<ng-icon hlm size="2xl" name="lucideCircleX" class="tw-text-purple tw-mb-2" />
				<h1 hlmH1 class="tw-text-oebblack tw-text-md tw-font-semibold tw-max-w-[30ch]">
					{{ 'BadgeCollection.collectionNotPublic' | translate }}
				</h1>
			</section>
		</div>
	</div>`,
})
export class PublicNotFoundBadgeCollectionComponent {}
