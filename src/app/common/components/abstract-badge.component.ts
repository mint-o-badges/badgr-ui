import { Input, OnChanges, SimpleChange, Directive } from '@angular/core';
import { BadgeClassManager } from '../../issuer/services/badgeclass-manager.service';
import { BadgeClass } from '../../issuer/models/badgeclass.model';
import { MessageService } from '../services/message.service';
import { IssuerUrl } from '../../issuer/models/issuer-api.model';
import { BadgeClassRef, BadgeClassSlug, BadgeClassUrl } from '../../issuer/models/badgeclass-api.model';
import { UpdatableSubject } from '../util/updatable-subject';
import { Observable, Subject } from 'rxjs';

export interface BadgeLookupData {
	badge?: BadgeClass;
	issuerId?: IssuerUrl;
	badgeSlug?: BadgeClassSlug;
	badgeId?: BadgeClassUrl | BadgeClassRef;
}

@Directive()
export class AbstractBadgeComponent implements OnChanges, BadgeLookupData {
	@Input()
	badge: BadgeClass;

	@Input()
	issuerId: IssuerUrl;

	@Input()
	badgeSlug: BadgeClassSlug;

	@Input()
	badgeId: BadgeClassRef | BadgeClassUrl;

	private inputBadge: BadgeClass;

	private _loading = true;
	get loading() {
		return this._loading && !this.forceFailed;
	}

	private _failed = false;
	get failed() {
		return this._failed || this.forceFailed;
	}

	@Input()
	private forceFailed = false;

	private badgeLoadingSubject = new Subject<BadgeLookupData>();

	get badgeIdDescription() {
		if (this.inputBadge || this.inputBadge === null)
			return `(inputBadge.badgeUrl: ${this.inputBadge && this.inputBadge.badgeUrl})`;
		else if (this.issuerId && this.badgeSlug) return `(issuerId: ${this.issuerId}, badgeSlug: ${this.badgeSlug})`;
		else return `(badgeId: ${this.badgeId})`;
	}

	get badgeLoading$(): Observable<BadgeLookupData> {
		return this.badgeLoadingSubject.asObservable();
	}

	private badgeLoadedSubject = new UpdatableSubject<BadgeClass>();

	get badgeLoaded$(): Observable<BadgeClass> {
		return this.badgeLoadedSubject.asObservable();
	}

	constructor(
		protected badgeManager: BadgeClassManager,
		protected messageService: MessageService,
	) {}

	ngOnChanges(changes: { [key: string]: SimpleChange }) {
		if ('badge' in changes) {
			this.inputBadge = this.badge;
			this.badge = null;
		}

		if ('badge' in changes || 'badgeId' in changes || 'badgeSlug' in changes || 'issuerId' in changes) {
			this.lookupBadge();
		}
	}

	private lookupBadge() {
		this._loading = true;
		this._failed = false;

		this.badgeLoadedSubject.reset();
		this.badgeLoadingSubject.next(this);

		// The setTimeout is added to trigger change detection. Super hacky, and apparently related to this:
		// https://github.com/angular/angular/issues/6005
		if (this.inputBadge || this.inputBadge === null) {
			// We consider null to be a valid badge. It's just an empty one. undefined,
			// on the other hand, indicates that the property wasn't set.
			setTimeout((x) => this.success(this.inputBadge));
		} else if (this.issuerId && this.badgeSlug) {
			this.badgeManager.badgeByIssuerUrlAndSlug(this.issuerId, this.badgeSlug).then(
				(b) => setTimeout((x) => this.success(b)),
				(err) =>
					this.fail(`Failed to load badge image for issuer ${this.issuerId} and slug ${this.badgeSlug}`, err),
			);
		} else if (this.badgeId) {
			this.badgeManager.badgeByRef(this.badgeId).then(
				(b) => setTimeout((x) => this.success(b)),
				(err) => this.fail(`Failed to load badge image ${this.badgeId}`, err),
			);
		} else {
			// We'll assume that the parent is loading the badge and wait for it to come in
		}
	}

	private fail(message: string, error: unknown) {
		this.messageService.reportHandledError(message, error);
		this._loading = false;
		this._failed = true;
		this.badgeLoadedSubject.error(error);
	}

	private success(badge: BadgeClass) {
		this.badge = badge;
		this.badgeLoadedSubject.safeNext(badge);

		this._loading = false;
	}
}
