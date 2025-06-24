import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceListenerDirective } from './directives/source-listener/source-listener.directive';
import { ImportModalComponent } from './components/import-modal/import-modal.component';
import { BadgrCommonModule, COMMON_IMPORTS } from '../common/badgr-common.module';
import { CommonEntityManagerModule } from '../entity-manager/entity-manager.module';
import { ImportLauncherDirective } from './directives/import-launcher/import-launcher.directive';

@NgModule({
    imports: [...COMMON_IMPORTS, BadgrCommonModule, CommonEntityManagerModule, SourceListenerDirective, ImportModalComponent, ImportLauncherDirective],
    exports: [SourceListenerDirective, ImportModalComponent, ImportLauncherDirective],
})
export class MozzTransitionModule {}
