import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnMenuItem } from '@spartan-ng/brain/menu';
import { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmMenuItem]',
	host: {
		'[class]': '_computedClass()',
		'[attr.data-variant]': 'variant()',
		'[attr.data-inset]': 'inset() ? "" : null',
		'[attr.data-size]': 'size() ? "" : null',
	},
	hostDirectives: [
		{
			directive: BrnMenuItem,
			inputs: ['disabled: disabled'],
			outputs: ['triggered: triggered'],
		},
	],
})
export class HlmMenuItem {
	public readonly variant = input<'default' | 'destructive'>('default');

	public readonly inset = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	public readonly size = input<'default' | 'sm' | 'lg'>('default');

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			`tw-group tw-w-full tw-relative tw-flex tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-none tw-transition-colors hover:tw-bg-accent hover:tw-text-accent-foreground focus-visible:tw-bg-accent focus-visible:tw-text-accent-foreground disabled:tw-pointer-events-none disabled:tw-opacity-50`,
			`tw-text-[14px] tw-leading-[19px] md:tw-text-[20px] md:tw-leading-[28px] tw-px-6 tw-py-3`,
			`data-[size=sm]:tw-text-[14px] data-[size=sm]:tw-leading-[15.6px] data-[size=sm]:md:tw-text-[14px] data-[size=sm]:md:tw-leading-[15.6px] data-[size=sm]:tw-px-4 data-[size=sm]:tw-py-[7px]`,
			`data-[size=md]:tw-text-[20px] data-[size=md]:tw-leading-[28px] data-[size=md]:md:tw-text-[24px] data-[size=md]:md:tw-leading-[33.6px]`,
			`data-[inset]:tw-pl-8`,
			`data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[ng-icon]:!text-destructive [&_ng-icon:not([class*='text-'])]:text-muted-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0`,
			this.userClass(),
		),
	);
}
