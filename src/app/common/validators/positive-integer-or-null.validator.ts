import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export class PositiveIntegerOrNullValidator {
	static valid(control: AbstractControl, translate?: TranslateService): ValidationErrors | null {
		const val = parseFloat(control.value);

		if (control.value === null || control.value === '' || control.value === undefined) {
			return null;
		}

		if (isNaN(val)) {
			return {
				emptyField: translate ? translate.instant('OEBComponents.fieldIsRequired') : 'This field is required.',
			};
		}

		if (!Number.isInteger(val) || val < 0) {
			return {
				negativeDuration: translate
					? translate.instant('CreateBadge.durationPositive')
					: 'Duration must be a positive integer.',
			};
		}

		return null;
	}
}
