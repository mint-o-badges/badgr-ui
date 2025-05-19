import { forwardRef, Inject, Injectable } from '@angular/core';
import { IssuerApiService } from './issuer-api.service';
import { Issuer } from '../models/issuer.model';
import { ApiIssuer, ApiIssuerForCreation, ApiIssuerForEditing, IssuerSlug } from '../models/issuer-api.model';
import { Observable } from 'rxjs';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { first, map } from 'rxjs/operators';

@Injectable()
export class IssuerManager {
	issuersList = new StandaloneEntitySet<Issuer, ApiIssuer>(
		(apiModel) => new Issuer(this.commonEntityManager),
		(apiModel) => apiModel.json.id,
		() => this.issuerApiService.listIssuers(),
	);

	allIssuersList = new StandaloneEntitySet<Issuer, ApiIssuer>(
		(apiModel) => new Issuer(this.commonEntityManager),
		(apiModel) => apiModel.json.id,
		() => this.issuerApiService.listAllIssuers(),
	);

	constructor(
		public issuerApiService: IssuerApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager,
	) {}

	createIssuer(initialIssuer: ApiIssuerForCreation): Promise<Issuer> {
		return this.issuerApiService
			.createIssuer(initialIssuer)
			.then((newIssuer) => this.issuersList.addOrUpdate(newIssuer));
	}

	get myIssuers$(): Observable<Issuer[]> {
		return this.issuersList.loaded$.pipe(map((l) => l.entities));
	}

	getAllIssuers(): Observable<Issuer[]> {
		return this.allIssuersList.loaded$.pipe(map((l) => l.entities));
	}

	editIssuer(issuerSlug: IssuerSlug, initialIssuer: ApiIssuerForEditing): Promise<Issuer> {
		return this.issuerApiService
			.editIssuer(issuerSlug, initialIssuer)
			.then((newIssuer) => this.issuersList.addOrUpdate(newIssuer));
	}

	deleteIssuer(issuerSlug: IssuerSlug, issuerToDelete: Issuer): Promise<boolean> {
		return this.issuerApiService
			.deleteIssuer(issuerSlug)
			.then((response) => this.issuersList.remove(issuerToDelete));
	}

	issuerBySlug(issuerSlug: IssuerSlug): Promise<Issuer> {
		return this.getAllIssuers()
			.pipe(first())
			.toPromise()
			.then(
				(issuers) =>
					issuers.find((i) => i.slug === issuerSlug) ||
					this.throwError(`Issuer Slug '${issuerSlug}' not found`),
			);
	}

	private throwError(message: string): never {
		throw new Error(message);
	}
}
