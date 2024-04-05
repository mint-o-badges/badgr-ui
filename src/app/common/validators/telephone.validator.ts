import { FormControl } from '@angular/forms';
import { ValidationResult } from './email.validator';

export class TelephoneValidator {
	static validTelephone(control: FormControl): ValidationResult {
		if (
			typeof control.value === 'string' &&
			control.value.trim().length > 0 &&
			!control.value.match(/^[\d\-+x\/()\s]+$/)
		) {
			return { invalidTelephone: true };
		} else {
			return null;
		}
	}
}
