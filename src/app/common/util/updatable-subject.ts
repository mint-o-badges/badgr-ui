import {Subject, Subscriber} from 'rxjs';

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

	override _subscribe(subscriber: Subscriber<T>) {
		const subscription = super._subscribe(subscriber);

		if (!this.hasFirstSubscriber) {
			this.onFirstSubscription();
			this.hasFirstSubscriber = true;
		}

		if (this._valueSet && subscription) {
			requestAnimationFrame(() => subscriber.next(this._value!));
		}

		return subscription;
	}

	override next(value: T): void {
		this._valueSet = true;
		super.next(this._value = value);
	}

	override error(err: unknown): void {
		this.hasError = true;
		super.error(this.thrownError = err);
	}

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
