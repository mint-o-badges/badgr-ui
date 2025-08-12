// src/app/directives/hlm-table-directives.ts
import { computed, Directive, inject, InjectionToken, input, ValueProvider } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

// Configuration Interface and InjectionToken
export const HlmTableConfigToken = new InjectionToken<HlmTableVariant>('HlmTableConfig');
export interface HlmTableVariant {
	table: string;
	thead: string;
	tbody: string;
	tfoot: string;
	tr: string;
	th: string;
	td: string;
	caption: string;
}

export const HlmTableVariantDefault: HlmTableVariant = {
	table: 'tw-flex tw-flex-col tw-text-sm [&_hlm-trow:last-child]:tw-border-0 tw-caption-bottom',
	thead: '[&_tr]:border-b',
	tbody: '[&_tr:last-child]:border-0',
	tfoot: 'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
	tr: 'tw-flex tw-flex tw-border-b tw-border-border tw-transition-colors hover:tw-bg-muted/50 data-[state=selected]:tw-bg-muted',
	th: 'tw-flex tw-flex-none tw-h-12 tw-px-4 tw-text-sm tw-items-center tw-font-medium tw-text-muted-foreground [&:has([role=checkbox])]:tw-pr-0 tw-text-muted-foreground tw-whitespace-nowrap [&:has([role=checkbox])]:tw-pr-0 [&>[role=checkbox]]:tw-translate-y-[2px]',
	td: 'tw-flex tw-flex-none tw-p-4 tw-items-center [&:has([role=checkbox])]:tw-pr-0 tw-whitespace-nowrap [&:has([role=checkbox])]:tw-pr-0 [&>[role=checkbox]]:tw-translate-y-[2px]',
	caption: 'tw-text-center tw-block tw-mt-4 tw-text-sm tw-text-muted-foreground',
};

export function provideHlmTableConfig(config: Partial<HlmTableVariant>): ValueProvider {
	return {
		provide: HlmTableConfigToken,
		useValue: { ...HlmTableVariantDefault, ...config },
	};
}

export function injectHlmTableConfig(): HlmTableVariant {
	return inject(HlmTableConfigToken, { optional: true }) ?? HlmTableVariantDefault;
}

/**
 * Directive to apply Shadcn-like styling to a <table> element.
 * It resolves and provides base classes for its child table elements.
 * If a table has the `hlmTable` attribute, it will be styled with the provided variant.
 * The other table elements will check if a parent table has the `hlmTable` attribute and will be styled accordingly.
 */
@Directive({
	selector: 'table[hlmTable]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTable {
	/** Input to configure the variant of the table, this input has the highest priority. */
	public readonly userVariant = input<Partial<HlmTableVariant> | string>({}, { alias: 'hlmTable' });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	/** Global or default configuration provided by injectHlmTableConfig() */
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();

	// Protected variant that resolves user input to a full HlmTableVariant
	protected readonly _variant = computed<HlmTableVariant>(() => {
		const globalOrDefaultConfig = this._globalOrDefaultConfig;
		const localInputConfig = this.userVariant();

		// Priority 1: Local input object
		if (
			typeof localInputConfig === 'object' &&
			localInputConfig !== null &&
			Object.keys(localInputConfig).length > 0
		) {
			// Merge local input with the baseline provided by injectHlmTableConfig()
			// This ensures that properties not in localInputConfig still fall back to global/default values.
			return { ...globalOrDefaultConfig, ...localInputConfig };
		}
		// If localInputConfig is not a non-empty object (e.g., it's undefined, an empty object, or a string),
		// then the globalOrDefaultConfig (which is already the result of injected OR default) is used.
		return globalOrDefaultConfig;
	});

	// Computed class for the host <table> element
	protected readonly _computedClass = computed(() => hlm(this._variant().table, this.userClass()));
}

/**
 * Directive to apply Shadcn-like styling to a <thead> element
 * within an HlmTableDirective context.
 */
@Directive({
	selector: 'thead[hlmTHead]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTHead {
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(this._globalOrDefaultConfig ? this._globalOrDefaultConfig.thead.trim() : '', this.userClass()),
	);
}

/**
 * Directive to apply Shadcn-like styling to a <tbody> element
 * within an HlmTableDirective context.
 */
@Directive({
	selector: 'tbody[hlmTBody]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTBody {
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(this._globalOrDefaultConfig ? this._globalOrDefaultConfig.tbody.trim() : '', this.userClass()),
	);
}

/**
 * Directive to apply Shadcn-like styling to a <tfoot> element
 * within an HlmTableDirective context.
 */
@Directive({
	selector: 'tfoot[hlmTFoot]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTFoot {
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(this._globalOrDefaultConfig ? this._globalOrDefaultConfig.tfoot.trim() : '', this.userClass()),
	);
}

/**
 * Directive to apply Shadcn-like styling to a <tr> element
 * within an HlmTableDirective context.
 */
@Directive({
	selector: 'tr[hlmTr]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTr {
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(this._globalOrDefaultConfig ? this._globalOrDefaultConfig.tr.trim() : '', this.userClass()),
	);
}

/**
 * Directive to apply Shadcn-like styling to a <th> element
 * within an HlmTableDirective context.
 */
@Directive({
	selector: 'th[hlmTh]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTh {
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(this._globalOrDefaultConfig ? this._globalOrDefaultConfig.th.trim() : '', this.userClass()),
	);
}

/**
 * Directive to apply Shadcn-like styling to a <td> element
 * within an HlmTableDirective context.
 */
@Directive({
	selector: 'td[hlmTd]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTd {
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(this._globalOrDefaultConfig ? this._globalOrDefaultConfig.td.trim() : '', this.userClass()),
	);
}

/**
 * Directive to apply Shadcn-like styling to a <caption> element
 * within an HlmTableDirective context.
 */
@Directive({
	selector: 'caption[hlmCaption]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmCaption {
	private readonly _globalOrDefaultConfig = injectHlmTableConfig();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected readonly _computedClass = computed(() =>
		hlm(this._globalOrDefaultConfig ? this._globalOrDefaultConfig.caption.trim() : '', this.userClass()),
	);
}
