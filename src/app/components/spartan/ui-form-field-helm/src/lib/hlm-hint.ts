import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { ClassValue } from 'clsx';

@Directive({
	selector: 'hlm-hint',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmHint {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() => hlm('block text-sm text-muted-foreground', this.userClass()));
}
