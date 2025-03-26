import { Component, EventEmitter, Output } from '@angular/core';

import { BadgeClassManager } from '../../issuer/services/badgeclass-manager.service';
import { BadgeClass } from '../../issuer/models/badgeclass.model';
import { MessageService } from '../services/message.service';
import { AbstractBadgeComponent } from './abstract-badge.component';

@Component({
	selector: 'connected-badge',
	host: {
		class: 'card card-actionsright',
		'[title]': "failed ? 'Cannot load badge ' + badgeIdDescription : badge?.name",
	},
	template: `
		<a
			[routerLink]="['/issuer/issuers/', badge?.issuerSlug || '', 'badges', badge?.slug || '']"
			class="card-x-main"
		>
			<div class="card-x-image">
				<badge-image [badge]="badge" [size]="40" [forceFailed]="failed"></badge-image>
			</div>
			<div class="card-x-text">
				<h1>{{ loading ? 'Loading Badge...' : failed ? 'Unknown Badge' : badge.name }}</h1>
				<small [truncatedText]="badge ? badge.description : ''" [maxLength]="100"></small>
			</div>
		</a>
		<div class="card-x-actions">
			<button class="button button-secondaryghost l-offsetright l-offsetbottom" (click)="removeConnection()">
				Remove
			</button>
		</div>
	`,
	// Inputs from superclass must be specified here again due to https://github.com/angular/angular/issues/5415
	inputs: ['badge', 'issuerId', 'badgeSlug', 'badgeId', 'forceFailed'],
	standalone: false,
})
export class ConnectedBadgeComponent extends AbstractBadgeComponent {
	@Output()
	onRemove = new EventEmitter<BadgeClass>();

	constructor(
		protected badgeManager: BadgeClassManager,
		protected messageService: MessageService,
	) {
		super(badgeManager, messageService);
	}

	removeConnection() {
		this.onRemove.emit(this.badge);
	}
}
