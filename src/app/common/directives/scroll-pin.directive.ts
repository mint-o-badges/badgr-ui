import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({ selector: '.l-scrollpin', })
export class ScrollPinDirective implements AfterViewInit {
	private scrollElem: HTMLElement;

	constructor(
		private renderer: Renderer2,
		private elemRef: ElementRef,
	) {}

	private get elem(): HTMLElement {
		return this.elemRef.nativeElement as HTMLElement;
	}

	ngAfterViewInit() {
		this.elem.style.display = 'block';
		this.scrollElem = this.findScrollElem(this.elem);
		this.renderer.listen(this.scrollElem, 'scroll', () => this.updatePosition());
	}

	private updatePosition() {
		this.elem.style.position = 'static';
		const elemInParentPos = this.elemPosInContainer(this.scrollElem, this.elem);

		this.elem.style.position = 'relative';
		this.elem.style.top = Math.max(0, this.scrollElem.scrollTop - elemInParentPos.y) + 'px';
	}

	private elemPosInContainer(containerElem: HTMLElement, childElem: HTMLElement) {
		const pos = { x: 0, y: 0 };

		let elem = childElem;
		do {
			pos.x += elem.offsetLeft;
			pos.y += elem.offsetTop;

			elem = elem.offsetParent as HTMLElement;
		} while (elem !== containerElem && containerElem.contains(elem));

		// Edge case to handle relative parent
		if (elem === containerElem.offsetParent) {
			pos.x -= containerElem.offsetLeft;
			pos.y -= containerElem.offsetTop;
		}

		return pos;
	}

	private findScrollElem(elem: HTMLElement): HTMLElement {
		// Find the fist element...
		for (
			;
			elem &&
			elem !== document.body && // ...that isn't outside the body
			!this.isScrollableElem(elem); // ...that can scroll
			elem = elem.parentElement
		);

		return elem;
	}

	private isScrollableElem(elem: HTMLElement): boolean {
		const style = window.getComputedStyle(elem, null);

		return (
			style.overflowX === 'auto' ||
			style.overflowX === 'scroll' ||
			style.overflowY === 'auto' ||
			style.overflowY === 'scroll' ||
			style.overflow === 'auto' ||
			style.overflow === 'scroll'
		);
	}
}
