// import { ApiIssuer } from './issuer-api.model';
// import { ApiNetworkStaff } from './network-api.model';

// export interface INetworkV3 {
// 	created_at: string;

// 	updated_at: string;

// 	created_by: string;

// 	name: string;
// 	image: string;
// 	imageFrame: boolean;
// 	slug: string;
// 	description: string;

// 	staff: ApiNetworkStaff[];
// 	partner_issuers: ApiIssuer[];

// 	json: { id: string };
// }

// export class NetworkV3 implements INetworkV3 {
// 	created_at: string;
// 	updated_at: string;
// 	created_by: string;
// 	id: number;
// 	name: string;
// 	image: string;
// 	imageFrame: boolean;
// 	slug: string;
// 	description: string;
// 	json: { id: string };
// 	staff: ApiNetworkStaff[];
// 	partner_issuers: ApiIssuer[];

// 	constructor(data: INetworkV3) {
// 		this.created_at = data.created_at;
// 		this.updated_at = data.updated_at;
// 		this.created_by = data.created_by;
// 		this.name = data.name;
// 		this.image = data.image;
// 		this.imageFrame = data.imageFrame;
// 		this.slug = data.slug;
// 		this.description = data.description;
// 		this.json = data.json;
// 		this.staff = data.staff || [];
// 		this.partner_issuers = data.partner_issuers || [];
// 	}

// 	get createdAt(): Date {
// 		return new Date(this.created_at);
// 	}

// 	get url(): string {
// 		return this.json.id;
// 	}
// }
