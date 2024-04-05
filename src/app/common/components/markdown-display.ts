import { Component, Input } from '@angular/core';

@Component({
	selector: 'markdown-display',
	host: {},
	template: ` <div class="markdown" [bgMarkdown]="value"></div> `,
})
export class MarkdownDisplay {
	@Input() value = '';

	@Input() login = false;
}
