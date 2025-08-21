import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	selector: 'brn-switch-thumb[hlm],[hlmSwitchThumb]',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmSwitchThumb {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(
			'tw-bg-background dark:group-data-[state=unchecked]:tw-bg-foreground dark:group-data-[state=checked]:tw-bg-primary-foreground tw-pointer-events-none tw-transition-transform group-data-[state=checked]:tw-translate-x-[calc(100%-2px)]',
			'tw-block tw-h-5 tw-w-5 tw-rounded-full tw-bg-purple tw-shadow-lg tw-ring-0 tw-transition-transform group-data-[state=unchecked]:tw-translate-x-0',
			this.userClass(),
		),
	);
}
