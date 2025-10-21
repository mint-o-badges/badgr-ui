import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DateRangeValidator {
	/**
	 * Validates that an end date is after a start date
	 * @param startDateControlName - The name of the form control containing the start date
	 * @param errorKey - Optional custom error key (defaults to 'endDateBeforeStartDate')
	 * @returns ValidatorFn that can be applied to the end date control
	 */
	static endDateAfterStartDate(
		startDateControlName: string,
		errorKey: string = 'endDateBeforeStartDate',
	): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (!control.value) {
				return null; // Don't validate if end date is empty
			}

			const formGroup = control.parent;
			if (!formGroup) {
				return null; // Can't validate without parent form
			}

			const startDateControl = formGroup.get(startDateControlName);
			if (!startDateControl || !startDateControl.value) {
				return null; // Don't validate if start date is empty
			}

			const startDate = new Date(startDateControl.value);
			const endDate = new Date(control.value);

			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				return null; // Invalid dates, let other validators handle this
			}

			if (endDate <= startDate) {
				return { [errorKey]: true };
			}

			return null;
		};
	}
}
