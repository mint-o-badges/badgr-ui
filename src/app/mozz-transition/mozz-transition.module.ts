import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceListenerDirective } from './directives/source-listener/source-listener.directive';
import { BadgrCommonModule, COMMON_IMPORTS } from '../common/badgr-common.module';
import { CommonEntityManagerModule } from '../entity-manager/entity-manager.module';

@NgModule({
	imports: [...COMMON_IMPORTS, BadgrCommonModule, CommonEntityManagerModule],
	declarations: [SourceListenerDirective,],
	exports: [SourceListenerDirective,],
})
export class MozzTransitionModule {}
