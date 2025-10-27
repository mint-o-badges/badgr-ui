import { Injectable, inject } from '@angular/core';
import { BadgeClassInstances, BadgeInstance } from '../models/badgeinstance.model';
import { BadgeInstanceApiService } from './badgeinstance-api.service';
import { ApiBadgeInstanceForBatchCreation, ApiBadgeInstanceForCreation } from '../models/badgeinstance-api.model';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';

@Injectable({ providedIn: 'root' })
export class BadgeInstanceManager {
	badgeInstanceApiService = inject(BadgeInstanceApiService);
	commonManager = inject(CommonEntityManager);

	private instancesByBadgeClass: { [badgeClassSlug: string]: BadgeClassInstances } = {};

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	instancesForBadgeClass(issuerSlug: string, badgeClassSlug: string): Promise<BadgeClassInstances> {
		if (badgeClassSlug in this.instancesByBadgeClass) {
			return this.instancesByBadgeClass[badgeClassSlug].loadedPromise;
		} else {
			const instanceList = (this.instancesByBadgeClass[badgeClassSlug] = new BadgeClassInstances(
				this,
				issuerSlug,
				badgeClassSlug,
			));
			return instanceList.loadedPromise;
		}
	}

	createBadgeInstanceBatched(
		issuerSlug: string,
		badgeClassSlug: string,
		batchCreationInstance: ApiBadgeInstanceForBatchCreation,
	): Promise<BadgeInstance[]> {
		return this.instancesForBadgeClass(issuerSlug, badgeClassSlug).then((instances) =>
			instances.createBadgeInstanceBatched(batchCreationInstance),
		);
	}

	createBadgeInstance(
		issuerSlug: string,
		badgeClassSlug: string,
		initialBadgeInstance: ApiBadgeInstanceForCreation,
	): Promise<BadgeInstance> {
		return this.instancesForBadgeClass(issuerSlug, badgeClassSlug).then((instances) =>
			instances.createBadgeInstance(initialBadgeInstance),
		);
	}
}
