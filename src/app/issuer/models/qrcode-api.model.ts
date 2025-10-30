import { Issuer } from './issuer.model';

export interface ApiQRCode {
	title: string;
	createdBy: string;
	slug?: string;
	valid_from?: string;
	expires_at?: string;
	activity_start_date?: string;
	activity_end_date?: string;
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
