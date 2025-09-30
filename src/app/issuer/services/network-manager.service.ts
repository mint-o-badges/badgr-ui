import { forwardRef, Inject, Injectable } from '@angular/core';
import { NetworkApiService } from './network-api.service';
import { Network } from '../models/network.model';
import { ApiNetwork, ApiNetworkForCreation, ApiNetworkForEditing, NetworkSlug } from '../models/network-api.model';
import { combineLatest, firstValueFrom, Observable, of } from 'rxjs';
import { ManagedEntitySet, StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { catchError, first, map, withLatestFrom } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NetworkManager {
	networksList = new StandaloneEntitySet<Network, ApiNetwork>(
		(apiModel) => new Network(this.commonEntityManager),
		(apiModel) => apiModel.json.id,
		() => this.networkApiService.listNetworks(),
	);

	allNetworksList = new StandaloneEntitySet<Network, ApiNetwork>(
		(apiModel) => new Network(this.commonEntityManager),
		(apiModel) => apiModel.json.id,
		() => this.networkApiService.listAllNetworks(),
	);

	constructor(
		public networkApiService: NetworkApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager,
	) {}

	createNetwork(initialNetwork: ApiNetworkForCreation): Promise<Network> {
		return this.networkApiService
			.createNetwork(initialNetwork)
			.then((newNetwork) => this.networksList.addOrUpdate(newNetwork));
	}

	get myNetworks$(): Observable<Network[]> {
		return this.networksList.loaded$.pipe(map((l) => l.entities));
	}

	getAllNetworks(): Observable<Network[]> {
		return this.allNetworksList.loaded$.pipe(map((l) => l.entities));
	}

	editNetwork(issuerSlug: NetworkSlug, initialNetwork: ApiNetworkForEditing): Promise<Network> {
		return this.networkApiService
			.editNetwork(issuerSlug, initialNetwork)
			.then((newNetwork) => this.networksList.addOrUpdate(newNetwork));
	}

	deleteNetwork(issuerSlug: NetworkSlug, issuerToDelete: Network): Promise<boolean> {
		return this.networkApiService
			.deleteNetwork(issuerSlug)
			.then((response) => this.networksList.remove(issuerToDelete));
	}

	networkBySlug(networkSlug: NetworkSlug): Promise<Network> {
		return firstValueFrom(
			combineLatest([
				this.allNetworksList.loaded$.pipe(map((l) => l.entities)),
				this.networksList.loaded$.pipe(
					catchError((err: any) => of()),
					map((l) => l.entities),
				),
			]).pipe(
				map(([all, mine]) => {
					return mine.concat(all.filter((f) => mine.findIndex((m) => m.slug === f.slug) === -1));
				}),
			),
		).then(
			(networks) =>
				networks.find((i) => i.slug === networkSlug) ||
				this.throwError(`Network Slug '${networkSlug}' not found`),
		);
	}

	private throwError(message: string): never {
		throw new Error(message);
	}
}
