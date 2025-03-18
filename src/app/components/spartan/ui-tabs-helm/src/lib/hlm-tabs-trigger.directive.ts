import { Directive, Input, computed, signal, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnTabsTriggerDirective } from '@spartan-ng/brain/tabs';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const tabsVariants = cva('', {
	variants: {
		variant: {
			default: 'data-[state=inactive]:tw-border-white',
			lightpurple: 'data-[state=inactive]:tw-border-lightpurple',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type TabsVariants = VariantProps<typeof tabsVariants>;

@Directive({
	selector: '[hlmTabsTrigger]',
	standalone: true,
	hostDirectives: [{ directive: BrnTabsTriggerDirective, inputs: ['brnTabsTrigger: hlmTabsTrigger', 'disabled'] }],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTabsTriggerDirective {
	public readonly triggerFor = input.required<string>({ alias: 'hlmTabsTrigger' });

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	private readonly _settableClass = signal<ClassValue>('');
	setClass(value: ClassValue) {
		this._settableClass.set(value);
	}
	protected _computedClass = computed(() =>
		hlm(
			tabsVariants({
				variant: this._variant(),
			}),
			'tw-text-oebblack tw-text-[14px] tw-leading-[19px] md:tw-text-[20px] md:tw-leading-[28px] tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-px-3 tw-py-1.5 tw-transition-all focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 data-[state=active]:tw-text-purple tw-border-solid tw-border-b-2 tw-border-white data-[state=active]:tw-font-medium data-[state=active]:tw-border-purple data-[state=active]:tw-shadow-sm',
			this.userClass(),
			this._settableClass(),
		),
	);
	private readonly _variant = signal<TabsVariants['variant']>('default');
	@Input()
	set variant(variant: TabsVariants['variant']) {
		this._variant.set(variant);
	}
}
