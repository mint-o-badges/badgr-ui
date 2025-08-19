import { FormControl } from '@angular/forms';
import { ValidationResult } from './email.validator';

export class PasswordComplexityValidator {
	static securePassword(control: FormControl): ValidationResult {
		const value = control.value;

		if (!value) return null;

		const hasUpperCase = /[A-Z]/.test(value);
		const hasDigit = /\d/.test(value);
		const hasSpecialChar = /[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~€]/.test(value);

		const isValid = hasUpperCase && hasDigit && hasSpecialChar;

		return isValid ? null : { passwordComplexity: true };
	}
}
