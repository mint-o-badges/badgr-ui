import isEmail from 'validator/lib/isEmail';
import tlds from '../../../assets/data/tld-list.json';

const validTlds = new Set((tlds as any[]).map((tld) => tld.extension.replace('.', '').toLowerCase()));

const emailValidatorOptions = {
	allow_display_name: false,
	require_tld: true,
	allow_utf8_local_part: true,
	domain_specific_validation: true,
	allow_ip_domain: false,
	allow_underscores: true,
};

export function isValidEmail(email: string | null | undefined): boolean {
	if (!email || typeof email !== 'string') return false;

	const trimmed = email.trim().toLowerCase();
	if (trimmed.length === 0) return false;

	// regex suggested by https://www.regular-expressions.info/email.html
	// misses some edge cases, e.g. international characters, quoted strings
	const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
	if (!emailRegex.test(trimmed)) return false;

	// if (!isEmail(trimmed, emailValidatorOptions)) return false;

	const tld = trimmed.split('.').pop();
	if (!tld || !validTlds.has(tld)) return false;

	return true;
}
