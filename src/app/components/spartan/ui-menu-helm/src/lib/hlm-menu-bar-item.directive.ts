import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnMenuItemDirective } from '@spartan-ng/ui-menu-brain';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmMenuBarItem]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnMenuItemDirective],
})
export class HlmMenuBarItemDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-flex tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-none focus:tw-bg-accent focus:tw-text-accent-foreground aria-expanded:tw-bg-accent aria-expanded:tw-text-accent-foreground',
			this.userClass(),
		),
	);
}
