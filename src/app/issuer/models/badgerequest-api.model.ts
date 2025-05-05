export interface BadgeRequest {
	firstname: string;
	lastname: string;
	email: string;
	ageConfirmation: boolean;
	qrCodeId: string;
}

export interface ApiRequestedBadge {
	id?: number;
	entity_version?: number;
	entity_id: string;
	firstName: string;
	lastName: string;
	email: string;
	requestedOn: string;
	status: string;
	user: null | number;
}
