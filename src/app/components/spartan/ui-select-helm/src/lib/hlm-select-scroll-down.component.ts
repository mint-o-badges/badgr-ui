import { Component } from '@angular/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';

@Component({
	selector: 'hlm-select-scroll-down',
	standalone: true,
	imports: [HlmIconComponent],
	providers: [provideIcons({ lucideChevronDown })],
	host: {
		class: 'tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1',
	},
	template: `
		<hlm-icon class="tw-w-4 tw-h-4 tw-ml-2" name="lucideChevronDown" />
	`,
})
export class HlmSelectScrollDownComponent {}
