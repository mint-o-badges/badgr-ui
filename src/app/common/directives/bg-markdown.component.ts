import {AfterViewChecked, Directive, ElementRef, Input, Renderer2} from '@angular/core';

import {marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
import {DomSanitizer} from '@angular/platform-browser';

@Directive({
	selector: '[bgMarkdown]'
})
export class BgMarkdownComponent implements AfterViewChecked {
	renderedHtml?: string;

	@Input()
	set bgMarkdown(markdown: string) {
		markdown = markdown || "";
		this.renderedHtml = sanitizeHtml(marked.parse(
			markdown,
			{
				gfm: false,
				breaks: false,
				pedantic: false,
			}
		));
	}

	constructor(
		protected elemRef: ElementRef<HTMLElement>,
		private domSanitizer: DomSanitizer,
		private renderer: Renderer2
	) {
	}

	ngAfterViewChecked(): void {
		if (this.elemRef && this.elemRef.nativeElement) {
			this.renderer.setProperty(
				this.elemRef.nativeElement,
				"innerHTML",
				this.renderedHtml
			);
		}
	}
}
