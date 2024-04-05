import { AfterViewInit, ElementRef, Renderer2, Injectable } from '@angular/core';
import dialogPolyfill from 'dialog-polyfill';

@Injectable()
export abstract class BaseDialog implements AfterViewInit {
	constructor(
		protected componentElem: ElementRef<HTMLElement>,
		protected renderer: Renderer2,
	) {}

	private get dialogElem() {
		return this.componentElem.nativeElement.querySelector<HTMLDialogElement>('dialog');
	}

	ngAfterViewInit() {
		this.renderer.listen(this.dialogElem, 'close', () => this.onDialogClosed());
		this.renderer.listen(this.dialogElem, 'cancel', () => this.onDialogCanceled());

		if (!('showModal' in this.dialogElem)) {
			dialogPolyfill.registerDialog(this.dialogElem);
		}
	}

	protected showModal() {
		this.dialogElem.showModal();
		this.onDialogOpened();
	}

	protected closeModal() {
		this.dialogElem.close();
	}

	get isOpen() {
		return this.dialogElem.hasAttribute('open');
	}

	protected onDialogOpened() {
		document.documentElement.classList.add('l-dialogopen');
	}
	protected onDialogClosed() {
		document.documentElement.classList.remove('l-dialogopen');
	}
	protected onDialogCanceled() {}
}
