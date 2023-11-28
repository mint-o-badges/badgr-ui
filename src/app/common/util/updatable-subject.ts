import {Subject, Subscriber, Observer} from 'rxjs';

/**
 * A Subject for objects that will be loaded at some point and may be subsequently updated. Acts like a promise with updates:
 * - Subscribers get the current value upon subscription if it is available
 * - Subscribers get any future updates to the value when such updates occur
 *
 * @class UpdatableSubject<T>
 */
export class UpdatableSubject<T> extends Subject<T> {
	private _value: T | null = null;
	private _valueSet = false;

	private hasFirstSubscriber = false;

	/**
	 * @param onFirstSubscription Callback to be invoked upon the first subscription to this subject. Allows
	 * initialization actions to be deferred until something is interested in the subject.
	 */
	constructor(
		private onFirstSubscription: () => void = () => {}
	) {
		super();
	}

	getValue(): T | null {
		if (this.hasError) {
			throw this.thrownError;
		} else {
			return this._value;
		}
	}

	get value(): T | null {
		return this.getValue();
	}

	get isLoaded(): boolean {
		return this._valueSet;
	}

    /**
     * Subscribe to this subject with a given observer (typically a `Subscriber`).
     * If this is the first subscriber, `onFirstSubscription` is getting called.
     * If a value is already set, `next` is getting called once, and then for
     * every new updated value.
     */
	override subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null) {
		const subscriber = super.subscribe(observerOrNext) as Subscriber<T>;

		if (!this.hasFirstSubscriber) {
			this.onFirstSubscription();
			this.hasFirstSubscriber = true;
		}

		if (this._valueSet && subscriber) {
            // Inform of initial value (via `next`) on next animation frame
			requestAnimationFrame(() => subscriber.next(this._value!));
		}

		return subscriber;
	}

	override next(value: T): void {
		this._valueSet = true;
		super.next(this._value = value);
	}

	override error(err: unknown): void {
		this.hasError = true;
		super.error(this.thrownError = err);
	}

    /**
     * Exactly the same as `next`
     */
	safeNext(value: T): void {
		// TODO: Will next() work without a subscription check?
		this.next(value);
	}

	/**
	 * Resets this subject to a just-initialized state, with no current value.
	 */
	reset() {
		this._value = null;
		this._valueSet = false;
	}
}

export class LoadableValueSubject<T> extends UpdatableSubject<T> {
	constructor(
		private fetchData: () => Promise<T>
	) {
		super(() => this.update);
	}

	update(): Promise<T> {
		return this.fetchData().then(
			data => (this.safeNext(data), data)
		);
	}
}
