import { Component, computed, input } from '@angular/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent, provideIcons } from '../../../ui-icon-helm/src';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-item-sub-indicator',
	standalone: true,
	providers: [provideIcons({ lucideChevronRight })],
	imports: [HlmIconComponent],
	template: `
		<hlm-icon size="none" class="w-full h-full" name="lucideChevronRight" />
	`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuItemSubIndicatorComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm('tw-inline-block tw-ml-auto tw-h-4 tw-w-4', this.userClass()));
}
