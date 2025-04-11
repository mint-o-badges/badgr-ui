import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TypedFormControl } from '../../../common/util/typed-forms';
import { BadgrCommonModule } from '../../../common/badgr-common.module';

@Component({
	selector: 'app-upload-tab',
	standalone: true,
	imports: [CommonModule, TranslateModule, BadgrCommonModule],
	template: `
		<div class="u-padding-all3x">
			<bg-formfield-image
				imageLoaderName="basic"
				[placeholderImage]="uploadBadgeImageUrl"
				[control]="form.rawControlMap.image"
				(change)="onControlUpdated(form.controls.image)"
				class="formimage-badgeUpload"
			></bg-formfield-image>
		</div>
	`,
})
export class UploadTabComponent {
	@Input() form: any;
	@Input() uploadBadgeImageUrl: string;
	@Output() controlUpdated = new EventEmitter<TypedFormControl<unknown>>();

	onControlUpdated(control: TypedFormControl<unknown>) {
		this.controlUpdated.emit(control);
	}
}

@Component({
	selector: 'app-url-tab',
	standalone: true,
	imports: [CommonModule, TranslateModule, BadgrCommonModule],
	template: `
		<div class="u-padding-all3x">
			<div class="forminput">
				<bg-formfield-text
					urlField="true"
					[control]="form.rawControlMap.url"
					errorMessage="Bitte gib eine gültige URL ein"
					(change)="onControlUpdated(form.controls.url)"
					includeLabelAsWrapper="true"
					placeholder="{{ 'RecBadge.enterURL' | translate }}"
					[autofocus]="true"
					#urlField
				></bg-formfield-text>
			</div>
		</div>
	`,
})
export class UrlTabComponent {
	@Input() form: any;
	@Output() controlUpdated = new EventEmitter<TypedFormControl<unknown>>();

	onControlUpdated(control: TypedFormControl<unknown>) {
		this.controlUpdated.emit(control);
	}
}

@Component({
	selector: 'app-json-tab',
	standalone: true,
	imports: [CommonModule, TranslateModule, BadgrCommonModule],
	template: `
		<div class="u-padding-all3x">
			<div class="forminput">
				<bg-formfield-text
					[control]="form.rawControlMap.assertion"
					errorMessage="Bitte gib ein gültiges JSON ein"
					placeholder="{{ 'RecBadge.enterJSON' | translate }}"
					(change)="onControlUpdated(form.controls.assertion)"
					[multiline]="true"
					[monospaced]="true"
					[autofocus]="true"
					class="formfield-x-badgePasteJson-text-height"
					#jsonField
				></bg-formfield-text>
			</div>
		</div>
	`,
})
export class JsonTabComponent {
	@Input() form: any;
	@Output() controlUpdated = new EventEmitter<TypedFormControl<unknown>>();

	onControlUpdated(control: TypedFormControl<unknown>) {
		this.controlUpdated.emit(control);
	}
}
