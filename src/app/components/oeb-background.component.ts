import { Component, Input, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

export const bg = 'tw-block tw-absolute tw-z-0 tw-opacity-80 tw-select-none';

@Component({
	selector: 'oeb-background',
	imports: [],
	template: ` <img [class]="imgClass" [src]="image" alt="placeholder" /> `,
	host: {
		'[class]': '_computedClass()',
	},
})
export class OebBackgroundComponent {
	@Input() image: string;
	@Input() imgClass: string;

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(bg, this.userClass()));
}
