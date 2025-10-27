import { FormControl } from '@angular/forms';
import { isValidEmail } from '../util/is-valid-email';

export type ValidationResult = null | { [errorName: string]: boolean };

export class EmailValidator {
	static validEmail(control: FormControl): ValidationResult {
		return !control.value || isValidEmail(control.value) ? null : { invalidEmail: true };
	}
}
