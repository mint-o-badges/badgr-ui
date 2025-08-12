import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnMenu } from '@spartan-ng/brain/menu';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const menuVariants = cva(
	'tw-block tw-border-border tw-min-w-[8rem] tw-overflow-hidden tw-rounded-md tw-border tw-bg-popover tw-p-1 tw-text-popover-foreground tw-shadow-md data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2',
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
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnMenu],
	template: ` <ng-content /> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmMenu {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(menuVariants({ variant: this.variant() }), this.userClass()),
	);

	public readonly variant = input<MenuVariants['variant']>('default');
}
