import { Component,  Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
	selector: 'shadow-dom',
	template: `
		<div class="shadow-assets" #assetWrap></div>
		<div class="shadow-content" #contentWrap [innerHTML]="_content"></div>
	`,
	encapsulation: ViewEncapsulation.ShadowDom,
	standalone: false,
})
export class ShadowDomComponent {

	@Input() content: string;
	_content: SafeHtml = "";


	@Input() styles: string;
	@Input() script: string;

	@ViewChild('assetWrap') assetWrap;
	styleEl: HTMLStyleElement;
	scriptEl: HTMLScriptElement;

	@ViewChild('contentWrap') contentWrap;

	constructor(
		private domSanitizer: DomSanitizer,
		private router: Router,
	) {
	}

	ngOnChanges() {

		if (this.assetWrap) {
			const shadowRoot = this.assetWrap.nativeElement.getRootNode();
			if (this.styles) {
				// create style tag via js api, because angular won't allow it in template
				if (!this.styleEl) {
					this.styleEl = document.createElement('style');
					this.styleEl.setAttribute('type', 'text/css');
					console.log([1, this.assetWrap]);
					this.assetWrap.nativeElement.appendChild(this.styleEl);
				}
				this.styleEl.innerHTML = '';
				this.styleEl.appendChild(document.createTextNode(this.styles));
			}
		}

		if (this.content) {
			this._content = this.domSanitizer.bypassSecurityTrustHtml(this.content);
			this.contentWrap.nativeElement.removeEventListener('click', this.bindLinks.bind(this));
			this.contentWrap.nativeElement.addEventListener('click', this.bindLinks.bind(this));
		}
		if (this.assetWrap) {
			if (this.script) {
				// create script tag via js api, because angular won't allow it in template
				if (!this.scriptEl) {
					// delay inserting scripts to make sure HTML DOM was inserted
					setTimeout(() => {
						this.scriptEl = document.createElement('script');
						this.scriptEl.src = this.script;
						this.assetWrap.nativeElement.appendChild(this.scriptEl);
					}, 100)
				}
			}
		}
	}

	bindLinks(e: MouseEvent) {
		if ((e.target as HTMLElement).nodeName == 'A') {
			const a = e.target as HTMLAnchorElement;
			if (a.href) {
				const url = new URL(a.href);
				if (url.origin == location.origin) {
					this.router.navigate([url.pathname]);
					e.preventDefault();
				}
			}
		}
	}
}
