import { NgModule } from '@angular/core';
import { HlmSeparator } from './lib/hlm-separator.directive';

export * from './lib/hlm-separator.directive';

@NgModule({
	imports: [HlmSeparator],
	exports: [HlmSeparator],
})
export class HlmSeparatorModule {}
