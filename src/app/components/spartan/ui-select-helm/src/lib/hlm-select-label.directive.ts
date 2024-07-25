import { Directive, type OnInit, computed, inject, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnSelectLabelDirective } from '@spartan-ng/ui-select-brain';
import type { ClassValue } from 'clsx';
import { HlmSelectContentDirective } from './hlm-select-content.directive';

@Directive({
	selector: '[hlmSelectLabel], hlm-select-label',
	hostDirectives: [BrnSelectLabelDirective],
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmSelectLabelDirective implements OnInit {
	private readonly selectContent = inject(HlmSelectContentDirective);
	private readonly _stickyLabels = signal(false);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-pl-8 tw-pr-2 tw-text-sm tw-font-semibold rtl:tw-pl-2 rtl:tw-pr-8',
			this._stickyLabels() ? 'tw-sticky tw-top-0 tw-bg-popover tw-block tw-z-[2]' : '',
			this.userClass(),
		),
	);

	ngOnInit(): void {
		if (this.selectContent.stickyLabels) {
			this._stickyLabels.set(true);
		}
	}
}
