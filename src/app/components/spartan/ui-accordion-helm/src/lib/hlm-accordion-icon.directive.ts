import { Directive, computed, inject, input } from '@angular/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmIconDirective, provideHlmIconConfig } from '../../../ui-icon-helm/src/index';
import type { ClassValue } from 'clsx';
import { provideIcons } from '@ng-icons/core';

@Directive({
	selector: 'hlm-icon[hlmAccordionIcon], hlm-icon[hlmAccIcon]',
	standalone: true,
	providers: [provideIcons({ lucideChevronDown }), provideHlmIconConfig({ size: 'sm' })],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmAccordionIconDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm('tw-inline-block tw-h-4 tw-w-4 tw-transition-transform tw-duration-200', this.userClass()),
	);
}
