import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TypedFormControl } from '../../../common/util/typed-forms';
import { BadgrCommonModule } from '../../../common/badgr-common.module';

@Component({
	selector: 'app-badge-tabs',
	standalone: true,
	imports: [CommonModule, TranslateModule, ReactiveFormsModule, BadgrCommonModule],
	template: `
		<p class="u-padding-yaxis2x u-responsivepadding-xaxis border-light3 u-text-body u-background-light3">
			{{ 'RecBadge.addRecievedBadge' | translate }}
		</p>

		<div class="tabbar">
			<div
				class="tab"
				[class.tab-is-active]="currentTab === 'upload'"
				(click)="setCurrentTab('upload')"
				type="button"
			>
				{{ 'RecBadge.image' | translate }}
			</div>

			<div class="tab" [class.tab-is-active]="currentTab === 'url'" (click)="setCurrentTab('url')" type="button">
				URL
			</div>

			<div
				class="tab"
				[class.tab-is-active]="currentTab === 'json'"
				(click)="setCurrentTab('json')"
				type="button"
			>
				JSON
			</div>
		</div>

		<!-- Drag or upload Badge -->
		<div *ngIf="currentTab === 'upload'" class="u-padding-all3x">
			<bg-formfield-image
				imageLoaderName="basic"
				[placeholderImage]="uploadBadgeImageUrl"
				[control]="form.rawControlMap.image"
				(change)="onControlUpdated(form.controls.image)"
				class="formimage-badgeUpload"
			></bg-formfield-image>
		</div>

		<!-- ------- Paste badge URL  -->
		<div *ngIf="currentTab === 'url'" class="u-padding-all3x">
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

		<!-- ------- Paste badge JSON  -->
		<div *ngIf="currentTab === 'json'" class="u-padding-all3x">
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

		<div *ngIf="formError" class="u-padding-all3x">
			<div class="notification notification-warning notification-is-active">
				<div class="notification-x-icon">
					<svg icon="icon_priority_high"></svg>
				</div>
				<div class="notification-x-text">
					<h2>Uh Oh...</h2>
					<p>{{ formError }}</p>
				</div>
				<button class="notification-x-close buttonicon buttonicon-clear" (click)="onClearFormError()">
					<svg icon="icon_close"></svg>
					<span class="visuallyhidden">{{ 'RecBadge.closeNotification' | translate }}</span>
				</button>
			</div>
		</div>
	`,
})
export class UploadBadgeComponent {
	@Input() form: any;
	@Input() uploadBadgeImageUrl: string;
	@Input() formError: string;
	@Input() currentTab: 'upload' | 'url' | 'json' = 'upload';

	@Output() tabChange = new EventEmitter<'upload' | 'url' | 'json'>();
	@Output() controlUpdated = new EventEmitter<TypedFormControl<unknown>>();
	@Output() clearFormError = new EventEmitter<void>();

	setCurrentTab(tab: 'upload' | 'url' | 'json') {
		this.tabChange.emit(tab);
	}

	onControlUpdated(control: TypedFormControl<unknown>) {
		this.controlUpdated.emit(control);
	}

	onClearFormError() {
		this.clearFormError.emit();
	}
}
