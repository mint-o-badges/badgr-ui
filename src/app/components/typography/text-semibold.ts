import { Component, Input } from '@angular/core';

@Component({
	selector: 'oeb-text-semibold',
	standalone: true,
	imports: [],
	template: `<h3 class="tw-font-semibold md:tw-text-[20px] md:tw-leading-[24.4px] tw-text-[14px] tw-leading-[19.6px]" [innerHTML]="text"></h3> `,
})
export class TextSemibold {
	@Input() text: string;
}
