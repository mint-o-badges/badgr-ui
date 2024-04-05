import { Component, ElementRef, Renderer2 } from '@angular/core';
import { BaseDialog } from './base-dialog';

@Component({
	selector: 'markdown-hints-dialog',
	template: `
		<dialog
			aria-labelledby="markdownHintsDialog"
			aria-describedby="dialog1Desc"
			class="dialog dialog-is-active l-dialog dialog-clean"
			role="dialog"
		>
			<div class="dialog-x-box o-container">
				<div class="dialog-x-header">
					<h2 id="markdownHintsDialog" class="u-text-body-bold-caps text-dark1">Supported Markdown</h2>
					<button class="buttonicon buttonicon-link" (click)="closeDialog()">
						<svg icon="icon_close"></svg>
						<span class="visuallyhidden">Close</span>
					</button>
				</div>
				<div class="u-padding-yaxis2x u-margin-xaxis2x border border-top border-light3">
					<div class="markdown markdown-dark4">
						<h1>#This is an H1</h1>
						<h2>##This is an H2</h2>
						<h3>###This is an H3</h3>
						<p>
							<em>_These are italics_</em>
							<strong>**This is bold**</strong>
						</p>
						<p>[Link](<a href="">http://badgr.io/login</a>)</p>
						<ul>
							<li>- Unordered (bulleted) list item1</li>
							<li>- Unordered (bulleted) list item2</li>
						</ul>
						<ol>
							<li>Ordered (numbered) list item1</li>
							<li>Ordered (numbered) list item2</li>
						</ol>
					</div>
				</div>
			</div>
		</dialog>
	`,
})
export class MarkdownHintsDialog extends BaseDialog {
	constructor(componentElem: ElementRef, renderer: Renderer2) {
		super(componentElem, renderer);
	}
	openDialog = () => this.showModal();

	closeDialog = () => this.closeModal();
}
