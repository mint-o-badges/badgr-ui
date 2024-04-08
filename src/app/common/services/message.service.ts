import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { UpdatableSubject } from '../util/updatable-subject';

export interface FlashMessage {
	message: string;
	timestamp: number;
	status: string;
	detail?: string;
}

type MessageStatusType = 'success' | 'error' | 'info' | 'load-error' | 'fatal-error';

/**
 * A service for displaying application-level messages to the user, such notable API results (failure to load or
 * new object creation, etc...)
 */
@Injectable()
export class MessageService {
	message: FlashMessage;
	subject = new UpdatableSubject<FlashMessage>();

	private _pendingRequestCount = 0;

	private retainMessageOnNextRouteChange = false;

	private fatalErrorPresent = false;

	get message$(): Observable<FlashMessage> {
		return this.subject;
	}

	constructor() {
		this.dismissMessage();
	}

	incrementPendingRequestCount() {
		// Note: a setTimeout is needed here because not doing so causes the _pendingRequestCount value to change between
		// angular's dirty checking cycles, and causing errors.
		setTimeout(() => this._pendingRequestCount++);
	}

	decrementPendingRequestCount() {
		// Note: a setTimeout is needed here because not doing so causes the _pendingRequestCount value to change between
		// angular's dirty checking cycles, and causing errors.
		setTimeout(() => {
			if (this._pendingRequestCount > 0) {
				this._pendingRequestCount--;
			} else {
				console.error('Request counter tried to go below zero!');
			}
		});
	}

	get pendingRequestCount() {
		return this._pendingRequestCount;
	}

	/**
	 * Configures the MessageService to ues the given Router. We don't inject it in the constructor because when we do,
	 * we get a _different instance_ of the Router than what the rest of the application seems to get. Not sure why.
	 *
	 * @param router
	 */
	useRouter(router: Router) {
		// BS-1126: Dismiss message on route change
		router.events.subscribe((e) => {
			if (e instanceof NavigationEnd) {
				if (this.retainMessageOnNextRouteChange) {
					this.retainMessageOnNextRouteChange = false;
				} else {
					this.dismissMessage();
				}
			}
		});
	}

	getMessage(): FlashMessage {
		return this.message;
	}

	getFreshMessageString(maxAge: number): string {
		/* Returns the current message string if it is not older
		 * than maxAge (in milliseconds). One hour = 60 * 60 * 1000
		 */
		if (Date.now() - maxAge < this.message.timestamp) {
			return this.message.message;
		}

		return null;
	}

	setMessage(message: string, status: MessageStatusType = 'success') {
		this.message = {
			message,
			timestamp: Date.now(),
			status,
		};
		this.publish_message();
		return this.message;
	}

	/**
	 * Reports an error with loading content. This should be used with promises that are used in conjunction with
	 * BgAwaitPromises, which will display the error in the space on the page where the content was to be displayed.
	 *
	 * @param message
	 * @param exception
	 */
	reportLoadingError(message: string, exception?: unknown) {
		console.error('Loading Error: ' + message, exception);

		// Do not report the error to the message bar. Loading errors are to be displayed inline.

		// this.setMessage(
		// 	message,
		// 	"load-error"
		// );

		// Throw the error so the loading system can catch it
		throw new Error(message);
	}

	reportFatalError(message: string, detail?: string, exception?: unknown) {
		this.fatalErrorPresent = true;
		if (message) {
			this.setMessage(message, 'fatal-error');
			this.message.detail = detail;
		}
	}

	get hasFatalError(): boolean {
		return this.fatalErrorPresent;
	}

	/**
	 * Report an error that the user should be notified of, and will be rethrown to maintain a failed promise.
	 *
	 * @param message
	 * @param exception
	 * @param retainAfterNextNav
	 */
	reportAndThrowError(message: string, exception?: unknown, retainAfterNextNav = false): never {
		this.reportHandledError(message, exception, retainAfterNextNav);
		throw new Error(message);
	}

	/**
	 * Report an error that the user should be notified of, but will not be passed on in promises. The error is
	 * not thrown again.
	 *
	 * @param message
	 * @param exception
	 * @param retainAfterNextNav
	 */
	reportHandledError(message: string, exception?: unknown, retainAfterNextNav = false) {
		console.error(message, exception);
		this.setMessage(message, 'error');

		this.retainMessageOnNextRouteChange = retainAfterNextNav;
	}

	/**
	 * Report a successful operation that the user is probably already aware of and is not necessary to additionally
	 * inform them of. The message will still be logged.
	 *
	 * @param message
	 */
	reportMinorSuccess(message: string) {
		// We don't care about minor success messages in the UI for now.
		console.info(message);
		// this.setMessage(message, "success");
	}

	/**
	 * Report a successful operation that is important for the user to see.
	 *
	 * @param message Message to display to the user
	 * @param retainAfterNextNav If true, the message will persist past the next router navigation. Useful when a success
	 *  immediately routes the user to a new page.
	 */
	reportMajorSuccess(message: string, retainAfterNextNav = false) {
		this.setMessage(message, 'success');

		this.retainMessageOnNextRouteChange = retainAfterNextNav;
	}

	/**
	 * Report something.
	 *
	 * @param message Message to display to the user
	 * @param retainAfterNextNav If true, the message will persist past the next router navigation. Useful when a success
	 *  immediately routes the user to a new page.
	 */
	reportInfoMessage(message: string, retainAfterNextNav = false) {
		this.setMessage(message, 'info');

		this.retainMessageOnNextRouteChange = retainAfterNextNav;
	}

	dismissMessage() {
		this.message = null;
		this.publish_message();
	}

	private publish_message() {
		this.subject.safeNext(this.message);
	}
}
