import { Component, computed, input } from '@angular/core';
import { lucideCircle } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmIconComponent, provideIcons } from '../../../ui-icon-helm/src';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-item-radio',
	providers: [provideIcons({ lucideCircle })],
	imports: [HlmIconComponent],
	template: `
		<!-- Using 0.5rem for size to mimick h-2 w-2 -->
		<hlm-icon size="0.5rem" class="*:*:fill-current" name="lucideCircle" />
	`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuItemRadioComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'group-[.checked]:tw-opacity-100 tw-opacity-0 tw-absolute tw-left-2 tw-flex tw-h-3.5 tw-w-3.5 tw-items-center tw-justify-center',
			this.userClass(),
		),
	);
}
