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
  lucideBadge,
  lucideRepeat2,
  lucideLogOut,
  lucideQrCode,
  lucideCloudUpload

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
      lucideBadge,
      lucideRepeat2,
      lucideLogOut,
      lucideQrCode,
      lucideCloudUpload
    }),
  ],
})
export class SharedIconsModule {}
