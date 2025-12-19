import { Component, Output, EventEmitter, OnInit, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TypedFormGroup, TypedFormArray, TypedFormControl } from '~/common/util/typed-forms';
import { OebCheckboxComponent } from '~/components/oeb-checkbox.component';
import { OebInputComponent } from '~/components/input.component';
import { OebCollapsibleComponent } from '~/components/oeb-collapsible.component';
import { NgIcon } from '@ng-icons/core';
import { OebSeparatorComponent } from '~/components/oeb-separator.component';
import { OebButtonComponent } from '~/components/oeb-button.component';

@Component({
	selector: 'oeb-optional-details',
	standalone: true,
	imports: [
		CommonModule,
		TranslateModule,
		OebCheckboxComponent,
		OebInputComponent,
		OebCollapsibleComponent,
		NgIcon,
		OebSeparatorComponent,
		OebButtonComponent,
	],
	templateUrl: './optional-details.component.html',
})
export class OptionalDetailsComponent implements OnInit {
	readonly parentForm = input.required<TypedFormGroup<any, any>>();
	readonly showExpiration = input<boolean>(false);
	readonly showEvidence = input<boolean>(false);
	readonly showLocation = input<boolean>(false);
	readonly showCourseDate = input<boolean>(false);
	readonly showCourseUrl = input<boolean>(false);
	readonly courseUrlDefaultOpen = input<boolean>(false);
	readonly isOptional = input<boolean>(true);

	@Output() addEvidenceEvent = new EventEmitter<void>();
	@Output() removeEvidenceEvent = new EventEmitter<number>();

	ngOnInit() {
		if (!this.parentForm()) {
			throw new Error('parentForm is required for OptionalDetailsComponent');
		}
	}

	get evidenceItems(): TypedFormArray<any, any> | null {
		return (this.parentForm().controls['evidence_items'] as TypedFormArray<any, any>) || null;
	}

	addEvidence(): void {
		this.addEvidenceEvent.emit();
	}

	removeEvidence(index: number): void {
		this.removeEvidenceEvent.emit(index);
	}

	hasControl(controlName: string): boolean {
		return controlName in this.parentForm().controls;
	}

	getRawControl(controlName: string): FormControl {
		const typedControl = this.parentForm().controls[controlName] as TypedFormControl<any>;
		return typedControl.rawControl;
	}
}
