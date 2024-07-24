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
  lucideUsers

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
      lucideUsers
    }),
  ],
})
export class SharedIconsModule {}
