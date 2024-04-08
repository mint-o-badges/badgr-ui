import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function markControlsDirty(control: AbstractControl) {
	walkControls(control, (c) => c.markAsDirty());
}

export function markControlsTouched(control: AbstractControl) {
	walkControls(control, (c) => c.markAsTouched());
}

function walkControls(control: AbstractControl, fn: (ctrl: AbstractControl) => void) {
	fn(control);

	if (control instanceof FormGroup) {
		Object.getOwnPropertyNames(control.controls)
			.map((name) => control.controls[name])
			.forEach((c) => walkControls(c, fn));
	} else if (control instanceof FormArray) {
		control.controls.forEach((c) => walkControls(c, fn));
	}
}
