import {forwardRef, Inject, Injectable} from '@angular/core';
import {StandaloneEntitySet} from '../../common/model/managed-entity-set';
import {CommonEntityManager} from '../../entity-manager/services/common-entity-manager.service';
import { ApiSuperBadge } from '../models/superbadge-api.model';
import { SuperBadge } from '../models/superbadge.model';
import { SuperBadgeApiService } from './superbadge-api.service';
import {EventsService} from '../../common/services/events.service';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class SuperBadgeManager {
	superBadgeList = new StandaloneEntitySet<SuperBadge, ApiSuperBadge>(
		apiModel => new SuperBadge(this.commonEntityManager),
		apiModel => apiModel.slug,
		() => this.superBadgeApiService.listSuperBadges()
	);

	get allSuperBadges$(): Observable<SuperBadge[]> {
		return this.superBadgeList.loaded$.pipe(map((l) => l.entities));
	}

	constructor(
		public superBadgeApiService: SuperBadgeApiService,
		public eventsService: EventsService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager
	) {
		eventsService.profileEmailsChanged.subscribe(() => {
			this.updateIfLoaded();
		});
	}

	createSuperBadge(
		superBadgeIngo: ApiSuperBadge
	): Promise<SuperBadge> {
		return this.superBadgeApiService
			.addSuperBadge(superBadgeIngo)
			.then(newBadge => this.superBadgeList.addOrUpdate(newBadge))
			;
	}

	deleteSuperBadge(superBadge: SuperBadge) {
		return this.superBadgeApiService
			.removeSuperBadge(superBadge.slug)
			.then(() => this.superBadgeList.remove(superBadge))
			;
	}

	updateIfLoaded() {
		this.superBadgeList.updateIfLoaded();
	}
}
