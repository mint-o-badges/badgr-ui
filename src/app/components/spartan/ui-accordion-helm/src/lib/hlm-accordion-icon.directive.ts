import { Directive, computed, inject, input } from '@angular/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/ui-core';
// import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmIconComponent, provideIcons } from '../../../ui-icon-helm/src/index';
import type { ClassValue } from 'clsx';

@Directive({
	selector: 'hlm-icon[hlmAccordionIcon], hlm-icon[hlmAccIcon]',
	standalone: true,
	providers: [provideIcons({ lucideChevronDown })],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmAccordionIconDirective {
	private readonly _hlmIcon = inject(HlmIconComponent);

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm('tw-inline-block tw-h-4 tw-w-4 tw-transition-transform tw-duration-200', this.userClass()),
	);

	constructor() {
		this._hlmIcon.size = 'none';
		this._hlmIcon.name = 'lucideChevronDown';
	}
}
