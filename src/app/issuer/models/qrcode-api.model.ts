import { Issuer } from './issuer.model';

export interface ApiQRCode {
	title: string;
	createdBy: string;
	slug?: string;
	valid_from?: any;
	expires_at?: any;
	badgeclass_id?: string;
	issuer_id?: string;
	request_count?: number;
	notifications?: boolean;
}

export interface NetworkQrCodeGroup {
	issuer: Issuer;
	qrcodes: ApiQRCode[];
	staff: boolean;
}
