import { forwardRef, Inject, Injectable } from '@angular/core';
import { StandaloneEntitySet } from '~/common/model/managed-entity-set';
import { ApiNetwork, ApiNetworkForCreation, IssuerSlug } from '../models/issuer-api.model';
import { NetworkApiService } from './network-api.service';
import { IssuerManager } from './issuer-manager.service';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Network } from '../network.model';

@Injectable({
	providedIn: 'root',
})
export class NetworkManager {
	networksList = new StandaloneEntitySet<Network, ApiNetwork>(
		(apiModel) => new Network(this.commonEntityManager),
		(apiModel) => apiModel.json.id,
		() => this.networkApiService.listNetworks(),
	);

	constructor(
		public networkApiService: NetworkApiService,
		public issuerManager: IssuerManager,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager,
	) {}

	createNetwork(initialNetwork: ApiNetworkForCreation): Promise<Network> {
		return this.networkApiService
			.createNetwork({ ...initialNetwork, is_network: true })
			.then((newNetwork) => this.networksList.addOrUpdate(newNetwork));
	}

	get myNetworks$(): Observable<Network[]> {
		return this.networksList.loaded$.pipe(map((l) => l.entities));
	}

	editNetwork(networkSlug: IssuerSlug, editingNetwork: ApiNetworkForCreation): Promise<Network> {
		return this.networkApiService
			.editNetwork(networkSlug, editingNetwork)
			.then((updatedNetwork) => this.networksList.addOrUpdate(updatedNetwork));
	}

	deleteNetwork(networkSlug: IssuerSlug, networkToDelete: Network): Promise<boolean> {
		return this.networkApiService.deleteNetwork(networkSlug).then(() => this.networksList.remove(networkToDelete));
	}

	networkBySlug(networkSlug: IssuerSlug): Promise<Network> {
		return firstValueFrom(this.networksList.loaded$.pipe(map((l) => l.entities))).then(
			(networks) =>
				networks.find((n) => n.slug === networkSlug) ||
				this.throwError(`Network Slug '${networkSlug}' not found`),
		);
	}

	private throwError(message: string): never {
		throw new Error(message);
	}
}
