import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
	selector: 'oeb-checkbox',
	standalone: true,
	imports: [HlmPDirective, HlmCheckboxComponent],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => OebCheckboxComponent),
		multi: true
	}],
	template: `
		<label class="tw-flex tw-items-center" hlmP>
			<hlm-checkbox [checked]="checked" (changed)="onChange($event)" class="tw-mr-2" />
			{{ text }}
		</label>
	`,
})
export class OebCheckboxComponent implements ControlValueAccessor {
	@Input() text: string;
	@Output() checkedChange = new EventEmitter<boolean>();

	onChange(value) {
		this.checkedChange.emit(value);
	}

	private _checked = false;

	get checked() {
		return this._checked;
	}

	set checked(value: boolean) {
		this._checked = value;
		this.checkedChange.emit(this._checked);
		this.onChange(this._checked);
		this.onTouched();
	}

	onTouched = () => {};

	writeValue(value: boolean): void {
		this.checked = value;
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		// Handle disabled state if necessary
	}
}
