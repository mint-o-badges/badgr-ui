import { TypedFormGroup } from './typed-forms';
import { Subscription } from 'rxjs';

export function setupActivityOnlineSync(form: TypedFormGroup<any>): Subscription[] {
	const zipControl = form.controls['activity_zip'].rawControl;
	const cityControl = form.controls['activity_city'].rawControl;
	const onlineControl = form.controls['activity_online'].rawControl;

	if (!zipControl || !cityControl || !onlineControl) {
		console.warn('missing control');
		return [];
	}

	const subs: Subscription[] = [];

	const updateOnlineCheckboxState = () => {
		const hasAddressData = (zipControl.value?.length ?? 0) > 0 || (cityControl.value?.length ?? 0) > 0;
		if (hasAddressData) {
			onlineControl.disable({ emitEvent: false });
		} else {
			onlineControl.enable({ emitEvent: false });
		}
	};

	const updateAddressState = () => {
		if (onlineControl.value === true) {
			zipControl.disable({ emitEvent: false });
			cityControl.disable({ emitEvent: false });
		} else {
			zipControl.enable({ emitEvent: false });
			cityControl.enable({ emitEvent: false });
		}
	};

	updateOnlineCheckboxState();
	updateAddressState();

	subs.push(zipControl.valueChanges.subscribe(updateOnlineCheckboxState));
	subs.push(cityControl.valueChanges.subscribe(updateOnlineCheckboxState));
	subs.push(onlineControl.valueChanges.subscribe(updateAddressState));

	return subs;
}
