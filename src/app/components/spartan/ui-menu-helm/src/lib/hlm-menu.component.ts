import { Component, Input, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnMenuDirective } from '@spartan-ng/ui-menu-brain';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const menuVariants = cva(
	'tw-block tw-border-border tw-min-w-[8rem] tw-py-1 tw-overflow-hidden tw-rounded-md tw-border tw-bg-popover tw-text-popover-foreground tw-shadow-md data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2',
	{
		variants: {
			variant: {
				default: 'tw-my-0.5',
				menubar: 'tw-my-2',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);
type MenuVariants = VariantProps<typeof menuVariants>;

@Component({
	selector: 'hlm-menu',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnMenuDirective],
	template: `
		<ng-content />
	`,
})
export class HlmMenuComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(menuVariants({ variant: this._variant() }), this.userClass()));

	private readonly _variant = signal<MenuVariants['variant']>('default');
	@Input()
	set variant(value: MenuVariants['variant']) {
		this._variant.set(value);
	}
}
