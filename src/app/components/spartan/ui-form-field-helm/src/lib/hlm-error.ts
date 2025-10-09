import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { ClassValue } from 'clsx';

@Directive({
	selector: 'hlm-error',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmError {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm('block text-destructive text-sm font-medium', this.userClass()),
	);
}
