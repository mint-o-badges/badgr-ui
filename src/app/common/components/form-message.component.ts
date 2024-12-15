import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FlashMessage, MessageService } from '../services/message.service';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventsService } from '../services/events.service';
import Timeout = NodeJS.Timeout;
import { animationFramePromise } from '../util/promise-util';

interface Notification {
	submodule: 'notification-warning' | 'notification-success' | '';
	icon: 'icon_priority_high' | 'icon_checkmark' | 'icon_info';
	title: 'Attention' | 'Success' | 'Info' | 'Loading Error' | 'Fatal Error';
}

const messageStatusTypeToNotificationMap: { [key in string]: Notification } = {
	error: { submodule: 'notification-warning', title: 'Attention', icon: 'icon_priority_high' },
	'load-error': { submodule: 'notification-warning', title: 'Loading Error', icon: 'icon_priority_high' },
	'fatal-error': { submodule: 'notification-warning', title: 'Fatal Error', icon: 'icon_priority_high' },
	success: { submodule: 'notification-success', title: 'Success', icon: 'icon_checkmark' },
	info: { submodule: '', title: 'Info', icon: 'icon_checkmark' },
};

@Component({
    selector: 'form-message',
    template: ` <div class="l-toast">
		<div
			*ngIf="msg"
			class="notification notification-toast {{ notification.submodule }}"
			[class.notification-is-active]="message"
		>
			<div class="notification-x-icon">
				<svg class="navitem-x-icon" [attr.icon]="notification.icon"></svg>
			</div>
			<div class="notification-x-text">
				<h2>{{ notification.title }}</h2>
				<p>{{ msg }}</p>
			</div>
			<button class="notification-x-close buttonicon buttonicon-clear" (click)="dismissMessage()">
				<svg class="navitem-x-icon" [attr.icon]="'icon_close'"></svg>
				<span class="visuallyhidden">Close Notification</span>
			</button>
		</div>
	</div>`,
    standalone: false
})
export class FormMessageComponent implements OnInit, OnDestroy {
	messageDismissed = false;
	message: FlashMessage;
	msg: string;
	status: string;
	notification: Notification;
	subscription: Subscription;
	timeout: Timeout;
	private clickSubscription: Subscription;

	constructor(
		protected messageService: MessageService,
		protected router: Router,
		protected elemRef: ElementRef,
		protected eventService: EventsService,
	) {
		this.subscription = this.messageService.message$.subscribe((message) => {
			this.setMessage(message);
		});
		this.clickSubscription = this.eventService.documentClicked.subscribe((e) => {
			this.onDocumentClick(e);
		});
	}

	ngOnDestroy() {
		if (this.subscription) this.subscription.unsubscribe();
		if (this.clickSubscription) this.clickSubscription.unsubscribe();
	}

	ngOnInit() {
		this.setMessage(this.messageService.getMessage());
	}

	get element(): HTMLElement {
		return this.elemRef.nativeElement as HTMLElement;
	}

	onDocumentClick(ev: MouseEvent) {
		if (!this.element.contains(ev.target as Element)) {
			this.dismissMessage();
		}
	}

	toNotification(status: string): Notification {
		return messageStatusTypeToNotificationMap[status];
	}

	async setMessage(message: FlashMessage) {
		// wait a beat so dom click doesn't clear message
		// see: onDocumentClick above
		await animationFramePromise();
		this.messageDismissed = this.message && !message;

		this.message = message;
		if (message) {
			this.msg = message.message;
			this.status = message.status;
			this.notification = this.toNotification(message.status);
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			if (this.status === 'success') {
				this.timeout = setTimeout(() => {
					this.dismissMessage();
					this.timeout = null;
				}, 10000);
			}
		}
	}

	dismissMessage() {
		this.messageService.dismissMessage();
	}
}
