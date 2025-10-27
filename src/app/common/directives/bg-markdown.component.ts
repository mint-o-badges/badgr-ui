import { AfterViewChecked, Directive, ElementRef, Input, Renderer2, inject } from '@angular/core';

import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({ selector: '[bgMarkdown]' })
export class BgMarkdownComponent implements AfterViewChecked {
	protected elemRef = inject<ElementRef<HTMLElement>>(ElementRef);
	private domSanitizer = inject(DomSanitizer);
	private renderer = inject(Renderer2);

	renderedHtml?: string;

	@Input()
	set bgMarkdown(markdown: string) {
		markdown = markdown || '';
		this.renderedHtml = sanitizeHtml(
			marked.parse(markdown, {
				gfm: false,
				breaks: false,
				pedantic: false,
			}),
		);
	}

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	ngAfterViewChecked(): void {
		if (this.elemRef && this.elemRef.nativeElement) {
			this.renderer.setProperty(this.elemRef.nativeElement, 'innerHTML', this.renderedHtml);
		}
	}
}
