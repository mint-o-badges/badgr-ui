import { Component } from '@angular/core';
import { lucideChevronUp } from '@ng-icons/lucide';
import { HlmIconComponent, provideIcons } from "../../../ui-icon-helm/src";

@Component({
    selector: 'hlm-select-scroll-up',
    imports: [HlmIconComponent],
    providers: [provideIcons({ lucideChevronUp })],
    host: {
        class: 'tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1',
    },
    template: `
		<hlm-icon class="tw-w-4 tw-h-4 tw-ml-2" name="lucideChevronUp" />
	`
})
export class HlmSelectScrollUpComponent {}
