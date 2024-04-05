import { FormControl } from '@angular/forms';

interface ValidationResult {
	[errorName: string]: boolean;
}

export class MdImgValidator {
	static imageTest(control: FormControl) {
		if (control.value && control.value.indexOf('![') !== -1) {
			return { image: true };
		}
	}
}
