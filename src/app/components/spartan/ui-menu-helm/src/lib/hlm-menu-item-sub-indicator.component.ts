import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmIconDirective } from '../../../ui-icon-helm/src';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-item-sub-indicator',
	providers: [provideIcons({ lucideChevronRight })],
	imports: [NgIcon, HlmIconDirective],
	template: ` <ng-icon hlm size="none" class="tw-h-full tw-w-full" name="lucideChevronRight" /> `,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuItemSubIndicatorComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm('tw-inline-block tw-ml-auto tw-h-4 tw-w-4', this.userClass()));
}
