import { NgModule } from '@angular/core';

import { HlmAccordionContent } from './lib/hlm-accordion-content.directive';
import { HlmAccordionIcon } from './lib/hlm-accordion-icon.directive';
import { HlmAccordionItem } from './lib/hlm-accordion-item.directive';
import { HlmAccordionTrigger } from './lib/hlm-accordion-trigger.directive';
import { HlmAccordion } from './lib/hlm-accordion.directive';

export * from './lib/hlm-accordion-content.directive';
export * from './lib/hlm-accordion-icon.directive';
export * from './lib/hlm-accordion-item.directive';
export * from './lib/hlm-accordion-trigger.directive';
export * from './lib/hlm-accordion.directive';

export const HlmAccordionImports = [
	HlmAccordion,
	HlmAccordionItem,
	HlmAccordionTrigger,
	HlmAccordionContent,
	HlmAccordionIcon,
] as const;

@NgModule({
	imports: [...HlmAccordionImports],
	exports: [...HlmAccordionImports],
})
export class HlmAccordionModule {}
