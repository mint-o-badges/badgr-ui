import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	selector: 'brn-switch-thumb[hlm],[hlmSwitchThumb]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmSwitchThumbDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(
			'tw-block tw-h-5 tw-w-5 tw-rounded-full tw-bg-background tw-shadow-lg tw-ring-0 tw- transition-transform group-data-[state=checked]:tw-translate-x-5 group-data-[state=unchecked]:tw-translate-x-0',
			this.userClass(),
		),
	);
}
