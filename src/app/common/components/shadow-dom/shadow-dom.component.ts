import { Component, input, ViewChild, ViewEncapsulation } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { DynamicHooksComponent } from 'ngx-dynamic-hooks';
import { Router } from '@angular/router';
import { AiAssistantComponent } from '~/issuer/components/ai-assistant/ai-assistant.component';
import { LoadingDotsComponent } from '../loading-dots.component';

@Component({
	selector: 'shadow-dom',
	template: `
		<div class="shadow-assets" #assetWrap></div>
		<div class="shadow-wrap" #contentWrap>
			@if (_content) {
				<ngx-dynamic-hooks
					class="shadow-content"
					[content]="_content"
					[parsers]="dynamicComponents"
					[options]="{ sanitize: false }"
				></ngx-dynamic-hooks>
			} @else {
				<loading-dots />
			}
		</div>
	`,
	// has to be included as external stylesheet
	// so esbuild correctly resolves image urls in oeb_styles.scss
	styleUrls: ['./shadow-dom.component.scss'],
	encapsulation: ViewEncapsulation.ShadowDom,
	standalone: true,
	// FIXME: AiAssistantComponent is used in CMS HTML, ignore Angular warning?
	imports: [DynamicHooksComponent, AiAssistantComponent, LoadingDotsComponent],
})
export class ShadowDomComponent {
	content = input<string>();
	_content: SafeHtml = '';

	dynamicComponents = [AiAssistantComponent];

	styles = input<string>();
	script = input<string>();

	@ViewChild('assetWrap') assetWrap;
	styleEl: HTMLStyleElement;
	scriptEl: HTMLScriptElement;

	@ViewChild('contentWrap') contentWrap;

	constructor(private router: Router) {}

	ngOnChanges() {
		if (this.assetWrap) {
			if (this.styles()) {
				// create style tag via js api, because angular won't allow it in template
				if (!this.styleEl) {
					this.styleEl = document.createElement('style');
					this.styleEl.setAttribute('type', 'text/css');
					this.assetWrap.nativeElement.appendChild(this.styleEl);
				}
				this.styleEl.innerHTML = '';
				this.styleEl.appendChild(document.createTextNode(this.styles()));
			}
		}

		if (this.content()) {
			this._content = this.content();
			this.contentWrap.nativeElement.removeEventListener('click', this.bindLinks.bind(this));
			this.contentWrap.nativeElement.addEventListener('click', this.bindLinks.bind(this));
		}
		if (this.assetWrap) {
			if (this.script() && this._content) {
				// create script tag via js api, because angular won't allow it in template
				if (!this.scriptEl) {
					// delay inserting scripts to make sure HTML DOM was inserted
					this.scriptEl = document.createElement('script');
					this.scriptEl.src = this.script();
					this.assetWrap.nativeElement.appendChild(this.scriptEl);
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
