import { NgModule } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronDown,
  lucidePencil,
  lucideTrash2,
  lucideBadgeCheck,
  lucideFileText,
  lucideFileQuestion,
  lucideAward,
  lucideWarehouse,
  lucideChevronRight,
  lucideUsers,
  lucideDownload,
  lucideBadge

} from '@ng-icons/lucide';

@NgModule({
  providers: [
    provideIcons({
      lucideChevronDown,
      lucidePencil,
      lucideTrash2,
      lucideBadgeCheck,
      lucideFileText,
      lucideFileQuestion,
      lucideAward,
      lucideWarehouse,
      lucideChevronRight,
      lucideUsers,
      lucideDownload,
      lucideBadge
    }),
  ],
})
export class SharedIconsModule {}
