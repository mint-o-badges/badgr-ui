declare module 'clipboard/lib/clipboard' {
	class Clipboard {
		constructor(selector: string | HTMLElement | HTMLCollection | NodeList, options?: ClipboardOptions);

		destroy();

		on(eventName: 'success' | 'error', handler: (event: Event) => void);
	}

	interface ClipboardOptions {
		target?: (trigger: Element) => Element;
		text?: (trigger: Element) => string;
	}

	export = Clipboard;
}
