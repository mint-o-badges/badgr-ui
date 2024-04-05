import { CommonEntityManager } from './services/common-entity-manager.service';
import { NgModule } from '@angular/core';
import { BadgrCommonModule } from '../common/badgr-common.module';

@NgModule({
	imports: [BadgrCommonModule],
	providers: [CommonEntityManager],
})
export class CommonEntityManagerModule {}
