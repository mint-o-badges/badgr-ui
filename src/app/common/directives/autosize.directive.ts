import {
	AfterViewChecked,
	Directive,
	ElementRef,
	HostListener,
	Inject,
	Input,
	PLATFORM_ID,
	Renderer2,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * This file is derived from https://github.com/stevepapa/ng-autosize/blob/master/src/autosize.directive.ts released
 * under the MIT license, which is included below. The license below applies only to this single file.
 *
 * ===========================================
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Steve Papa
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

@Directive({
	selector: 'textarea[autosize]',
})
export class AutosizeDirective implements AfterViewChecked {
	private el: HTMLElement;
	private _minHeight: string;
	private _maxHeight: string;
	private _lastHeight: number;
	private _clientWidth: number;

	@Input('minHeight')
	get minHeight(): string {
		return this._minHeight;
	}
	set minHeight(val: string) {
		this._minHeight = val;
		this.updateMinHeight();
	}

	@Input('maxHeight')
	get maxHeight(): string {
		return this._maxHeight;
	}
	set maxHeight(val: string) {
		this._maxHeight = val;
		this.updateMaxHeight();
	}

	@HostListener('window:resize', ['$event.target'])
	onResize(textArea: HTMLTextAreaElement): void {
		// Only apply adjustment if element width had changed.
		if (this.el.clientWidth === this._clientWidth) {
			return;
		}
		this._clientWidth = this.element.nativeElement.clientWidth;
		this.adjust();
	}

	@HostListener('input', ['$event.target'])
	onInput(textArea: HTMLTextAreaElement): void {
		this.adjust();
	}

	constructor(
		@Inject(PLATFORM_ID) private platformId: {},
		private renderer: Renderer2,
		public element: ElementRef,
	) {
		this.el = element.nativeElement;
		this._clientWidth = this.el.clientWidth;
	}

	ngAfterViewChecked(): void {
		// set element resize allowed manually by user
		if (isPlatformBrowser(this.platformId)) {
			const style = window.getComputedStyle(this.el, null);
			if (style.resize === 'both') {
				this.renderer.setStyle(this.el, 'resize', 'horizontal');
			} else if (style.resize === 'vertical') {
				this.renderer.setStyle(this.el, 'resize', 'none');
			}
			// run first adjust
			this.adjust();
		}
	}

	adjust(): void {
		// perform height adjustments after input changes, if height is different
		if (this.el.style.height === this.element.nativeElement.scrollHeight + 'px') {
			return;
		}
		this.renderer.setStyle(this.el, 'overflow', 'hidden');
		this.renderer.setStyle(this.el, 'height', this.el.scrollHeight + 'px');
	}

	updateMinHeight(): void {
		// Set textarea min height if input defined
		this.renderer.setStyle(this.el, 'minHeight', this._minHeight + 'px');
	}

	updateMaxHeight(): void {
		// Set textarea max height if input defined
		this.renderer.setStyle(this.el, 'maxHeight', this._maxHeight + 'px');
	}
}
