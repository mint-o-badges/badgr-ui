import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnTabsTrigger } from '@spartan-ng/brain/tabs';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const tabsVariants = cva('', {
	variants: {
		variant: {
			default:
				'data-[state=inactive]:tw-border-white data-[state=active]:tw-border-purple data-[state=active]:tw-text-purple',
			lightpurple:
				'data-[state=inactive]:tw-border-lightpurple data-[state=active]:tw-border-purple data-[state=active]:tw-text-purple',
			black: 'data-[state=inactive]:tw-border-[#CCD7FF] data-[state=active]:tw-border-oebblack',
			bluebackground:
				'data-[state=active]:tw-bg-[#CCD7FF] tw-rounded-[10px] data-[state=inactive]:tw-border-[#CCD7FF] tw-border-2 tw-text-purple data-[state=active]:tw-font-semibold',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type TabsVariants = VariantProps<typeof tabsVariants>;

@Directive({
	selector: '[hlmTabsTrigger]',
	hostDirectives: [{ directive: BrnTabsTrigger, inputs: ['brnTabsTrigger: hlmTabsTrigger', 'disabled'] }],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTabsTrigger {
	public readonly triggerFor = input.required<string>({ alias: 'hlmTabsTrigger' });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly _variant = input<TabsVariants['variant']>('default');
	protected readonly _computedClass = computed(() =>
		hlm(
			tabsVariants({
				variant: this._variant(),
			}),
			'tw-text-oebblack tw-text-[14px] tw-leading-[19px] md:tw-text-[20px] md:tw-leading-[28px] tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-px-3 tw-py-1.5 tw-transition-all focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-border-solid tw-border-b-2 tw-border-white data-[state=active]:tw-font-medium data-[state=active]:tw-shadow-sm [&_ng-icon]:tw-pointer-events-none [&_ng-icon]:tw-shrink-0 [&_ng-icon]:tw-text-base',
			this.userClass(),
		),
	);
}
