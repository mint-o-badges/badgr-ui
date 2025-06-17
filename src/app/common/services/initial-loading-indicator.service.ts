import { Injectable } from '@angular/core';

/**
 * Service to manage the initial loading indicator, allowing customizations to when it is hidden.
 */
@Injectable({ providedIn: 'root' })
export class InitialLoadingIndicatorService {
	private _initialLoadedPromise: Promise<unknown>;

	get initialLoadedPromise() {
		return this._initialLoadedPromise;
	}

	set initialLoadedPromise(promise: Promise<unknown>) {
		const thisPromise = (this._initialLoadedPromise = promise.then(() => {
			// Only hide the indicator if this promise is the most recent one set
			if (this._initialLoadedPromise == thisPromise) {
				this.hideIndicator();
			}
		}));
	}

	constructor() {
		// The default behavior is to hide the loading message as soon as angular is ready. Here, by using setTimeout, we're
		// scheduling that for the next angular cycle. If something sets a new promise before the next cycle, however, it
		// will preempt this default.
		// UPDATE: Jan 2018 -- this trick didnt work in production mode, setting timeout to 100ms for smoothing
		this.initialLoadedPromise = new Promise((resolve) => setTimeout(resolve, 100));
	}

	private hideIndicator() {
		const indicatorElem = document.getElementById('initial-loading-indicator');
		if (indicatorElem) {
			indicatorElem.style.display = 'none';
		}
	}
}
