import { Component, Input } from '@angular/core';
import { BgMarkdownComponent } from '../directives/bg-markdown.component';

@Component({
    selector: 'markdown-display',
    host: {},
    template: ` <div class="markdown" [bgMarkdown]="value"></div> `,
    imports: [BgMarkdownComponent],
})
export class MarkdownDisplay {
	@Input() value = '';

	@Input() login = false;
}
