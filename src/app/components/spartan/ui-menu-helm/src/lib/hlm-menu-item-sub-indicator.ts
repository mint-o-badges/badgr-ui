import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-item-sub-indicator',
	providers: [provideIcons({ lucideChevronRight })],
	imports: [NgIcon, HlmIcon],
	template: ` <ng-icon hlm size="none" class="tw-w-full tw-h-full" name="lucideChevronRight" /> `,
	host: {
		'[class]': '_computedClass()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmMenuItemSubIndicator {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm('tw-inline-block tw-ml-auto tw-h-4 tw-w-4', this.userClass()),
	);
}
