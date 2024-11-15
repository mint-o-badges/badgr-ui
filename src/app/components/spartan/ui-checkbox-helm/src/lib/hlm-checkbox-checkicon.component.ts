import { Component, computed, inject, input } from '@angular/core';
import { lucideCheck } from '@ng-icons/lucide';
import { BrnCheckboxComponent } from '@spartan-ng/ui-checkbox-brain';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent, provideIcons } from '../../../ui-icon-helm/src';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-checkbox-checkicon',
	standalone: true,
	imports: [HlmIconComponent],
	providers: [provideIcons({ lucideCheck })],
	host: {
		'[class]': '_computedClass()',
	},
	template: ` <hlm-icon size="base" [name]="iconName()" /> `,
})
export class HlmCheckboxCheckIconComponent {
	private _brnCheckbox = inject(BrnCheckboxComponent);
	protected _checked = this._brnCheckbox?.isChecked;
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	public readonly iconName = input<string>('lucideCheck');

	protected _computedClass = computed(() =>
		hlm(
			'tw-h-6 tw-w-6 tw-leading-none group-data-[state=unchecked]:tw-opacity-0',
			this._checked() === 'indeterminate' ? 'tw-opacity-50' : '',
			this.userClass(),
		),
	);
}
