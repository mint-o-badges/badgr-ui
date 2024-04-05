import { AbstractControl } from '@angular/forms';
import isURL from 'validator/lib/isURL';
import { ValidationResult } from './email.validator';

export class UrlValidator {
	static validUrl(control: AbstractControl): ValidationResult {
		return typeof control.value !== 'string' ||
			control.value.trim() === '' ||
			isURL(control.value, {
				require_tld: false,
				require_protocol: true,
				require_host: false,
				require_valid_protocol: false,
				allow_underscores: true,
				allow_trailing_dot: true,
				allow_protocol_relative_urls: false,
			})
			? null
			: { validUrl: true };
	}

	static addMissingHttpToControl(control: AbstractControl): void {
		const url = control.value;
		if (url && url.search(/https?:/) === -1) {
			control.setValue('http://' + url);
		}
	}
}
