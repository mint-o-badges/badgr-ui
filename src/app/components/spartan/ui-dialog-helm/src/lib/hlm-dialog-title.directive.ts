import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnDialogTitleDirective } from '@spartan-ng/ui-dialog-brain';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmDialogTitle]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnDialogTitleDirective],
})
export class HlmDialogTitleDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm('tw-text-lg tw-font-semibold tw-leading-none tw-tracking-tight', this.userClass()));
}
