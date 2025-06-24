import { isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Input,
	PLATFORM_ID,
	ViewEncapsulation,
	computed,
	inject,
	signal,
	type OnDestroy,
} from '@angular/core';
import { NgIconComponent, type IconName } from '@ng-icons/core';
import { hlm } from '@spartan-ng/brain/core';
import { cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const DEFINED_SIZES = ['xxs', 'xs', 'sm', 'base', 'lg', 'xl', 'xxl', 'xxxl', 'none'] as const;

type DefinedSizes = (typeof DEFINED_SIZES)[number];

export const iconVariants = cva('tw-inline-flex', {
	variants: {
		variant: {
			xxs: 'tw-h-3 tw-w-3 !tw-mr-1',
			xs: 'tw-h-3 tw-w-3 !tw-mr-2',
			sm: 'tw-h-4 tw-w-4 !tw-mr-2',
			base: 'tw-h-6 tw-w-6',
			lg: 'tw-h-8 tw-w-8',
			xl: 'tw-h-12 tw-w-12',
			xxl: 'tw-h-16 tw-w-16',
			xxxl: 'tw-h-20 tw-w-20',
			none: '',
		} satisfies Record<DefinedSizes, string>,
	},
	defaultVariants: {
		variant: 'base',
	},
});

// eslint-disable-next-line @typescript-eslint/ban-types
export type IconSize = DefinedSizes | (Record<never, never> & string);

const isDefinedSize = (size: IconSize): size is DefinedSizes => {
	return DEFINED_SIZES.includes(size as DefinedSizes);
};

const TAILWIND_H_W_PATTERN = /\b(h-\d+|w-\d+)\b/g;

@Component({
	selector: 'hlm-icon',
	imports: [NgIconComponent],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<ng-icon
			[class]="ngIconCls()"
			[size]="ngIconSize()"
			[name]="_name()"
			[color]="_color()"
			[strokeWidth]="_strokeWidth()"
		/>
	`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmIconComponent implements OnDestroy {
	private readonly _host = inject(ElementRef);
	private readonly _platformId = inject(PLATFORM_ID);

	private _mutObs?: MutationObserver;

	private readonly _hostClasses = signal<string>('');

	protected readonly _name = signal<IconName | string>('');
	protected readonly _size = signal<IconSize>('base');
	protected readonly _color = signal<string | undefined>(undefined);
	protected readonly _strokeWidth = signal<string | number | undefined>(undefined);
	protected readonly userCls = signal<ClassValue>('');
	protected readonly ngIconSize = computed(() => (isDefinedSize(this._size()) ? '100%' : (this._size() as string)));
	protected readonly ngIconCls = signal<ClassValue>('');

	protected readonly _computedClass = computed(() => {
		const size: IconSize = this._size();
		const hostClasses = this._hostClasses();
		const userCls = this.userCls();
		const variant = isDefinedSize(size) ? size : 'none';
		const classes =
			variant === 'none' && size === 'none' ? hostClasses : hostClasses.replace(TAILWIND_H_W_PATTERN, '');
		return hlm(iconVariants({ variant }), userCls, classes);
	});

	constructor() {
		if (isPlatformBrowser(this._platformId)) {
			this._mutObs = new MutationObserver((mutations: MutationRecord[]) => {
				mutations.forEach((mutation: MutationRecord) => {
					if (mutation.attributeName !== 'class') return;
					this._hostClasses.set((mutation.target as Node & { className?: string })?.className ?? '');
				});
			});
			this._mutObs.observe(this._host.nativeElement, {
				attributes: true,
			});
		}
	}

	ngOnDestroy() {
		this._mutObs?.disconnect();
		this._mutObs = undefined;
	}

	@Input()
	set name(value: IconName | string) {
		this._name.set(value);
	}

	@Input()
	set size(value: IconSize) {
		// in case sent size value doesn't exist in defined sizes use base
		// this resolve the issue of having same icon size when button zise is updated
		if (DEFINED_SIZES.includes(value as any)) {
			this._size.set(value);
		} else {
			this._size.set('base');
		}
	}

	@Input()
	set color(value: string | undefined) {
		this._color.set(value);
	}

	@Input()
	set strokeWidth(value: string | number | undefined) {
		this._strokeWidth.set(value);
	}

	@Input()
	set ngIconClass(cls: ClassValue) {
		this.ngIconCls.set(cls);
	}

	@Input()
	set class(cls: ClassValue) {
		this.userCls.set(cls);
	}
}
