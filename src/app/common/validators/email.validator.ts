import { FormControl } from '@angular/forms';
import isEmail from 'validator/lib/isEmail';

export type ValidationResult = null | {
	[errorName: string]: boolean;
};

export class EmailValidator {
	static validEmail(control: FormControl): ValidationResult {
		return typeof control.value !== 'string' || control.value.trim().length === 0 || isEmail(control.value)
			? null
			: { invalidEmail: true };
	}
}
