import {
	ApiNetwork,
	ApiNetworkStaff,
	NetworkRef,
	NetworkSlug,
	NetworkStaffRef,
	NetworkStaffRoleSlug,
	NetworkUrl,
} from './network-api.model';
import { ManagedEntity } from '../../common/model/managed-entity';
import { ApiEntityRef } from '../../common/model/entity-ref';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { EmbeddedEntitySet } from '../../common/model/managed-entity-set';
import { Issuer } from './issuer.model';

export class Network extends ManagedEntity<ApiNetwork, NetworkRef> {
	readonly staff = new EmbeddedEntitySet(
		this,
		() => this.apiModel.staff,
		(apiEntry) => new NetworkStaffMember(this),
		NetworkStaffMember.urlFromApiModel,
	);

	readonly partnerIssuers = new EmbeddedEntitySet(
		this,
		() => this.apiModel.partner_issuers,
		(apiEntry) => new Issuer(this.commonManager, apiEntry),
		Issuer.urlFromApiModel,
	);

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': this.networkUrl,
			slug: this.apiModel.slug,
		};
	}

	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiNetwork = null,
		onUpdateSubscribed: () => void = undefined,
	) {
		super(commonManager, onUpdateSubscribed);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	get networkUrl(): NetworkUrl {
		return this.apiModel.json.id;
	}

	get slug(): NetworkSlug {
		return this.apiModel.slug;
	}

	get name(): string {
		return this.apiModel.name;
	}

	get description(): string {
		return this.apiModel.description;
	}

	get image(): string {
		return this.apiModel.image;
	}

	get websiteUrl(): string {
		return this.apiModel.json.url;
	}

	get createdAt(): Date {
		return new Date(this.apiModel.created_at);
	}

	get country(): string {
		return this.apiModel.country;
	}

	get state(): string {
		return this.apiModel.state;
	}

	async update(): Promise<this> {
		// this.applyApiModel(await this.issuerApiService.getNetwork(this.slug), true);
		return this;
	}

	// async delete(): Promise<ApiNetwork> {
	// 	return this.issuerApiService.deleteNetwork(this.slug);
	// }

	private get networkApiService() {
		return this.commonManager.networkManager.networkApiService;
	}

	async addStaffMember(role: NetworkStaffRoleSlug, email: string): Promise<this> {
		await this.networkApiService.updateStaff(this.slug, {
			action: 'add',
			email,
			role,
		});

		return this.update();
	}

	get currentUserStaffMember(): NetworkStaffMember {
		if (this.profileManager.userProfile && this.profileManager.userProfile.emails.entities) {
			const emails = this.profileManager.userProfile.emails.entities;

			return (
				this.staff.entities.find(
					(staffMember) => !!emails.find((profileEmail) => profileEmail.email === staffMember.email),
				) || null
			);
		} else {
			return null;
		}
	}
}

export class NetworkStaffMember extends ManagedEntity<ApiNetworkStaff, NetworkStaffRef> {
	get roleSlug() {
		return this.apiModel.role;
	}
	get roleInfo() {
		return issuerRoleInfoFor(this.roleSlug);
	}
	get email() {
		return this.apiModel.user.email;
	}
	get telephone() {
		return typeof this.apiModel.user.telephone === 'string'
			? this.apiModel.user.telephone
			: this.apiModel.user.telephone[0];
	}
	get url() {
		return typeof this.apiModel.user.url === 'string' ? this.apiModel.user.url : this.apiModel.user.url[0];
	}
	get firstName() {
		return this.apiModel.user.first_name;
	}
	get lastName() {
		return this.apiModel.user.last_name;
	}

	set roleSlug(role: NetworkStaffRoleSlug) {
		this.apiModel.role = role;
	}

	get isOwner(): boolean {
		return this.roleSlug === 'owner';
	}

	get isEditor(): boolean {
		return this.roleSlug === 'editor';
	}

	/**
	 * Evaluates if the user has the permission to make edits,
	 * specifically to create/edit network. This is only if the user
	 * is an owner.
	 *
	 * @returns {boolean}
	 */
	get canEditNetwork(): boolean {
		return this.isOwner;
	}

	/**
	 * Evaluates if the user has the permission to make edits,
	 * specifically to create badges. This is the case if the user
	 * is either an owner, or an editor.
	 *
	 * @returns {boolean}
	 */
	get canEditBadge(): boolean {
		return this.isOwner || this.isEditor;
	}

	/**
	 * Returns a label to use for this member based on the name if it's available (e.g. "Luke Skywalker"), or the email
	 * if it isn't (e.g. "lskywalker@rebel.alliance")
	 *
	 * @returns {string}
	 */
	get nameLabel(): string {
		const names = [this.firstName, this.lastName].filter((n) => n && n.length > 0);
		if (names.length > 0) {
			return names.join(' ');
		} else {
			return this.email;
		}
	}

	/**
	 * Returns a label to use for this member based on the name and email if available (e.g. "Luke Skywalker (lskywalker@rebel.alliance)")
	 *
	 * @returns {string}
	 */
	get fullLabel(): string {
		const names = [this.firstName, this.lastName].filter((n) => n && n.length > 0);
		if (names.length > 0) {
			return names.join(' ') + `(${this.email})`;
		} else {
			return this.email;
		}
	}

	static urlFromApiModel(apiStaff: ApiNetworkStaff) {
		return apiStaff.user ? apiStaff.user.email : '';
	}
	constructor(public issuer: Network) {
		super(issuer.commonManager);
	}

	protected buildApiRef(): NetworkStaffRef {
		return {
			'@id': NetworkStaffMember.urlFromApiModel(this.apiModel),
			slug: NetworkStaffMember.urlFromApiModel(this.apiModel),
		};
	}

	async save(): Promise<NetworkStaffMember> {
		await this.issuerManager.issuerApiService.updateStaff(this.issuer.slug, {
			action: 'modify',
			email: this.email,
			role: this.apiModel.role,
		});

		return this.issuer.update().then(() => this);
	}

	async remove(): Promise<Network> {
		await this.issuerManager.issuerApiService.updateStaff(this.issuer.slug, {
			action: 'remove',
			email: this.email,
		});

		return this.issuer.update();
	}
}

// ToDo: the following texts are already added to de/en.json files, please make sure to use their reference when reactivating English lang
export const networkStaffRoles = [
	{
		slug: 'owner',
		label: 'Network.addMember_owner',
		indefiniteLabel: 'an owner',
		description: 'Network.staffOwnerRights',
	},
	{
		slug: 'editor',
		label: 'Network.addMember_editor',
		indefiniteLabel: 'an editor',
		description: 'Network.staffEditorRights',
	},
	{
		slug: 'staff',
		label: 'Network.addMember_staff',
		indefiniteLabel: 'a staff member',
		description: 'Network.staffMemberRights',
	},
];
export function issuerRoleInfoFor(slug: NetworkStaffRoleSlug) {
	return networkStaffRoles.find((r) => r.slug === slug);
}
