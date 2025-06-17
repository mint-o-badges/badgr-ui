import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { ClassValue } from 'clsx';
import { HlmIconDirective } from '~/components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';

@Component({
	selector: 'hlm-pagination-ellipsis',
	imports: [NgIcon, HlmIconDirective],
	providers: [provideIcons({ lucideEllipsis })],
	template: `
		<span [class]="_computedClass()">
			<ng-icon hlm size="sm" name="lucideEllipsis" />
			<span class="tw-sr-only">More pages</span>
		</span>
	`,
})
export class HlmPaginationEllipsisComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm('tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center', this.userClass()),
	);
}
