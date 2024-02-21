import { forwardRef, Inject, Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { BadgeClass } from '../models/badgeclass.model';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import {
	ApiBadgeClass,
	ApiBadgeClassForCreation,
	BadgeClassRef,
	BadgeClassSlug,
	BadgeClassUrl,
} from '../models/badgeclass-api.model';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { BadgeClassApiService } from './badgeclass-api.service';
import { IssuerSlug, IssuerUrl } from '../models/issuer-api.model';
import { AnyRefType, EntityRef } from '../../common/model/entity-ref';
import { ManagedEntityGrouping } from '../../common/model/entity-set';
import { MessageService } from '../../common/services/message.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { first, map } from 'rxjs/operators';
import { ApiSuperBadge } from '../models/superbadge-api.model';
import { SuperBadge } from '../models/superbadge.model';

@Injectable()
export class BadgeClassManager extends BaseHttpApiService {
	badgesList = new StandaloneEntitySet<BadgeClass, ApiBadgeClass>(
		(apiModel) => new BadgeClass(this.commonEntityManager),
		(apiModel) => apiModel.json.id,
		() => this.badgeClassApi.getAllUserBadgeClasses()
	);
	allBadgesList = new StandaloneEntitySet<BadgeClass, ApiBadgeClass>(
		(apiModel) => new BadgeClass(this.commonEntityManager),
		(apiModel) => apiModel.json.id,
		() => this.badgeClassApi.getAllBadgeClasses()
	);
	badgesByIssuerUrl = new ManagedEntityGrouping<BadgeClass>(this.badgesList, (badgeClass) => badgeClass.issuerUrl);

	get badgeClasses() {
		return this.badgesList.entities;
	}

	get badgeClassesByIssuerUrl(): { [issuerUrl: string]: BadgeClass[] } {
		return this.badgesByIssuerUrl.grouped;
	}

	get badgesByIssuerUrl$(): Observable<{ [issuerUrl: string]: BadgeClass[] }> {
		return this.badgesByIssuerUrl.loaded$;
	}

	get allBadges$(): Observable<BadgeClass[]> {
		return this.badgesList.loaded$.pipe(map((l) => l.entities));
	}

	get allPublicBadges$(): Observable<BadgeClass[]> {
		return this.allBadgesList.loaded$.pipe(map((l) => l.entities));
	}

	get loadedBadges$(): Observable<BadgeClass[]> {
		return this.badgesList.loaded$.pipe(map((l) => l.entities));
	}

	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		@Inject(forwardRef(() => CommonEntityManager))
		protected commonEntityManager: CommonEntityManager,
		public badgeClassApi: BadgeClassApiService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	removeBadgeClass(badge: BadgeClass) {
		return this.badgeClassApi.deleteBadgeClass(badge.issuerSlug, badge.slug).then((response) => {
			this.allBadgesList.remove(badge);
			this.badgesList.remove(badge);
			return response;
		});
	}

	createBadgeClass(issuerSlug: string, newBadge: ApiBadgeClassForCreation): Promise<BadgeClass> {
		return this.badgeClassApi
			.createBadgeClass(issuerSlug, newBadge)
			.then((retNewBadge) => { this.allBadgesList.addOrUpdate(retNewBadge); return this.badgesList.addOrUpdate(retNewBadge) });
	}

	createSuperBadgeClass(newSuperBadge: ApiSuperBadge): any {
		return this.badgeClassApi.createSuperBadgeClass(newSuperBadge)
	}

	badgeByIssuerUrlAndSlug(issuerId: IssuerUrl, badgeSlug: BadgeClassSlug): Promise<BadgeClass> {
		return this.allBadges$
			.pipe(first())
			.toPromise()
			.then(
				(badges) =>
					badges.find((b) => b.issuerUrl === issuerId && b.slug === badgeSlug) ||
					this.throwError(`Issuer ID '${issuerId}' has no badge with slug '${badgeSlug}'`)
			);
	}

	badgeByIssuerSlugAndSlug(issuerSlug: IssuerSlug, badgeSlug: BadgeClassSlug): Promise<BadgeClass> {
		return this.allBadges$
			.pipe(first())
			.toPromise()
			.then(
				(badges) =>
					badges.find((b) => b.issuerSlug === issuerSlug && b.slug === badgeSlug) ||
					this.throwError(`Issuer Slug '${issuerSlug}' has no badge with slug '${badgeSlug}'`)
			);
	}

	loadedBadgeByRef(badgeRef: BadgeClassRef | BadgeClassUrl): BadgeClass {
		const badgeUrl = EntityRef.urlForRef(badgeRef);

		return this.badgeClasses.find((b) => b.badgeUrl === badgeUrl);
	}

	loadedBadgeByIssuerIdAndSlug(issuerId: string, badgeSlug: string): BadgeClass {
		return this.badgeClasses.find((b) => b.issuerUrl === issuerId && b.slug === badgeSlug);
	}

	badgeByRef(badgeRef: AnyRefType): Promise<BadgeClass> {
		// TODO: How do we load a particular badge by ID... potentially one not local to this system?
		const badgeUrl = EntityRef.urlForRef(badgeRef);

		return this.allBadges$
			.pipe(first())
			.toPromise()
			.then(
				(badges) =>
					badges.find((b) => b.badgeUrl === badgeUrl) || this.throwError(`No badge with URL ${badgeUrl}`)
			);
	}

	badgesByUrls(badgeUrls: string[]): Promise<BadgeClass[]> {
		if (!badgeUrls || badgeUrls.length === 0) {
			return Promise.resolve([]);
		}

		return this.allBadges$
			.pipe(first())
			.toPromise()
			.then((badges) => badges.filter((b) => badgeUrls.indexOf(b.badgeUrl) >= 0));
	}

	private throwError(message: string): never {
		throw new Error(message);
	}
}
