import { Component, computed, input } from '@angular/core';
import { lucideCheck } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent, provideIcons } from '../../../ui-icon-helm/src';
import type { ClassValue } from 'clsx';

@Component({
    selector: 'hlm-menu-item-check',
    providers: [provideIcons({ lucideCheck })],
    imports: [HlmIconComponent],
    template: `
		<!-- Using 1rem for size to mimick h-4 w-4 -->
		<hlm-icon size="1rem" name="lucideCheck" />
	`,
    host: {
        '[class]': '_computedClass()',
    }
})
export class HlmMenuItemCheckComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'group-[.checked]:tw-opacity-100 tw-opacity-0 tw-absolute tw-left-2 tw-flex tw-h-3.5 tw-w-3.5 tw-items-center tw-justify-center',
			this.userClass(),
		),
	);
}
