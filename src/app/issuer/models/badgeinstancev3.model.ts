import { ApiBadgeInstance } from './badgeinstance-api.model';

export class BadgeInstanceV3 {
	slug: string;
	created_at: string;
	issued_on: string;
	expires: string | null;
	recipient_identifier: string;
	recipient_type: string;
	revoked: boolean;
	revocation_reason: string | null;
	extensions: any;
	public_url: string;
	badge_class: any;
	issuer: any;

	constructor(data: ApiBadgeInstance) {
		Object.assign(this, data);

		if (!this.issued_on && data.json?.issuedOn) {
			this.issued_on = data.json.issuedOn;
		}
	}

	get issuedOn(): Date {
		return new Date(this.issued_on);
	}

	getExtension(name: string, defaultValue: any = null) {
		return this.extensions && this.extensions[name] ? this.extensions[name] : defaultValue;
	}
}
