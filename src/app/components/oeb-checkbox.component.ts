import { Component, EventEmitter, forwardRef, computed, input, Input, Output } from '@angular/core';
import { HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src';
import { HlmLabelDirective, HlmLabelModule } from './spartan/ui-label-helm/src';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ClassValue } from 'clsx';
import { hlm } from '@spartan-ng/ui-core';

@Component({
    selector: 'oeb-checkbox',
    standalone: true,
    imports: [HlmPDirective, HlmCheckboxComponent],      
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => OebCheckboxComponent),
            multi: true,
        }
    ],
    template: `
        <label class="tw-flex tw-items-center" hlmP>
            <hlm-checkbox [name]="name" (changed)="onChange($event)" class="tw-mr-2" />
            {{text}}
        </label>`,
    host: {
		'[class]': '_computedClass()',
	},
})
export class OebCheckboxComponent implements ControlValueAccessor  {
    @Input() text: string;
	@Input() control: FormControl;
	@Input() name: string;

    @Input() ngModel: boolean;
    @Input() value: string;

    // Output prop name must be Input prop name + 'Change'
    // Use in your component to write an updated value back out to the parent
    @Output() ngModelChange = new EventEmitter<string>();

    onChange(event){
        this.ngModelChange.emit(event)
    }

    //Angeular needs these for custom implementations of ngModel
    writeValue(value: string): void {
        this.value = value ? value : ''
    }
    registerOnChange(fn: any): void { }
    registerOnTouched(fn: any): void { }
    setDisabledState?(isDisabled: boolean): void {  }

    public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(this.userClass()));
}