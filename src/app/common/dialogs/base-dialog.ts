import { AfterViewInit, ElementRef, Renderer2, Injectable, inject } from '@angular/core';
import dialogPolyfill from 'dialog-polyfill';

@Injectable({ providedIn: 'root' })
export abstract class BaseDialog implements AfterViewInit {
	protected componentElem = inject<ElementRef<HTMLElement>>(ElementRef);
	protected renderer = inject(Renderer2);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	private get dialogElem() {
		return this.componentElem.nativeElement.querySelector<HTMLDialogElement>('dialog');
	}

	// eslint-disable-next-line @angular-eslint/contextual-lifecycle
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
