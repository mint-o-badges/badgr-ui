import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnDialogCloseDirective } from '@spartan-ng/brain/dialog';
import { HlmButtonDirective } from '../../../ui-button-helm/src';
import { provideHlmIconConfig } from '../../../ui-icon-helm/src';
import type { ClassValue } from 'clsx';
import { provideBrnButtonConfig } from '../../../ui-button-helm/src/lib/hlm-button.token';

@Directive({
	selector: '[hlmCommandDialogCloseBtn]',
	standalone: true,
	hostDirectives: [HlmButtonDirective, BrnDialogCloseDirective],
	providers: [provideBrnButtonConfig({ variant: 'default' }), provideHlmIconConfig({ size: 'xs' })],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmCommandDialogCloseButtonDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'tw-absolute tw-top-3 tw-right-3 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-ring tw-font-medium tw-h-10 hover:tw-bg-accent hover:tw-text-accent-foreground tw-inline-flex tw-items-center tw-justify-center tw-px-4 tw-py-2 tw-ring-offset-background tw-rounded-md tw-text-sm tw-transition-colors !tw-h-5 !tw-p-1 !tw-w-5',
			this.userClass(),
		),
	);
}
