import {
	PublicApiBadgeAssertion,
	PublicApiBadgeAssertion_OB2,
	PublicApiBadgeAssertion_OB3,
} from '~/public/models/public-api.model';

export function isOB2Assertion(assertion: PublicApiBadgeAssertion): assertion is PublicApiBadgeAssertion_OB2 {
	return assertion.obVersion === '2.0' || typeof assertion.type === 'string';
}

export function isOB3Assertion(assertion: PublicApiBadgeAssertion): assertion is PublicApiBadgeAssertion_OB3 {
	return (
		assertion.obVersion === '3.0' ||
		(Array.isArray(assertion.type) && assertion.type.includes('VerifiableCredential'))
	);
}

export function getAssertionExpiration(assertion: PublicApiBadgeAssertion): string | undefined {
	return isOB2Assertion(assertion) ? assertion.expires : assertion.validUntil;
}

export function getAssertionIssuedDate(assertion: PublicApiBadgeAssertion): string | undefined {
	return isOB2Assertion(assertion) ? assertion.issuedOn : assertion.validFrom;
}

export function getAssertionBadgeName(assertion: PublicApiBadgeAssertion): string {
	if (isOB2Assertion(assertion)) {
		return typeof assertion.badge === 'string' ? '' : assertion.badge.name;
	} else {
		return assertion.name;
	}
}

export function getAssertionRecipient(assertion: PublicApiBadgeAssertion): string | undefined {
	if (isOB2Assertion(assertion)) {
		const extRecipient =
			'extensions:recipientProfile' in assertion ? assertion['extensions:recipientProfile']['Name'] : undefined;
		if (extRecipient) return extRecipient;

		return assertion.recipient.identity;
	} else {
		const idObj = assertion.credentialSubject.identifier[0];
		if (!idObj) return undefined;

		if (idObj.hashed) return `[Hashed ${idObj.identityType}]`;

		return idObj.identityHash || undefined;
	}
}
