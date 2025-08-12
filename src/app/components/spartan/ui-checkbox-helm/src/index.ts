import { NgModule } from '@angular/core';

import { HlmCheckboxCheckIcon } from './lib/hlm-checkbox-checkicon.component';
import { HlmCheckbox } from './lib/hlm-checkbox.component';

export * from './lib/hlm-checkbox-checkicon.component';
export * from './lib/hlm-checkbox.component';

export const HlmCheckboxImports = [HlmCheckbox, HlmCheckboxCheckIcon] as const;
@NgModule({
	imports: [...HlmCheckboxImports],
	exports: [...HlmCheckboxImports],
})
export class HlmCheckboxModule {}
