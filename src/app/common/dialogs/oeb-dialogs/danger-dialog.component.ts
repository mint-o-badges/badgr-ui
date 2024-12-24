import { Component, HostBinding, Input, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/ui-dialog-brain';
import { OebDialogComponent } from '../../../components/oeb-dialog.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src';
import { HlmIconComponent, HlmIconModule, provideIcons } from '../../../components/spartan/ui-icon-helm/src';
import { lucideTriangleAlert } from '@ng-icons/lucide';
import { NgIf } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'oeb-danger-dialog',
	standalone: true,
	imports: [OebDialogComponent, OebButtonComponent, HlmPDirective, HlmIconComponent, NgIf],
	providers: [TranslateService, provideIcons({ lucideTriangleAlert })],
	template: `
		<oeb-dialog [variant]="variant" class="tw-text-center tw-text-oebblack">
			<div class="tw-flex tw-justify-center">
				<div class="oeb-icon-circle tw-my-4">
					<hlm-icon class="tw-text-red" size="xxl" name="lucideTriangleAlert" />
				</div>
			</div>
			<p hlmP class="tw-flex tw-flex-col tw-gap-2 tw-my-2">
				<span class="tw-font-extrabold tw-uppercase">{{ caption }}</span>
				<span *ngIf="text">
					<p hlmP [innerHtml]="text"></p>
					<span *ngIf="qrCodeRequested">Damit gehen alle noch offenen Badge-Anfragen verloren.</span>
				</span>
			</p>
			<oeb-button
				(click)="clickSingleButton()"
				size="sm"
				*ngIf="singleButtonText; else TwoButtons"
				[text]="singleButtonText"
			>
			</oeb-button>
			<ng-template #TwoButtons>
				<div class="tw-flex tw-justify-around tw-mt-6">
					<oeb-button variant="secondary" [text]="cancelText" (click)="closeDialog()"></oeb-button>
					<oeb-button class="tw-mr-4" [text]="deleteText" (click)="deleteItem()"></oeb-button>
				</div>
			</ng-template>
		</oeb-dialog>
	`,
})
export class DangerDialogComponent {
	// @HostBinding('class') private readonly _class: string = 'tw-bg-red tw-bg-red';
	private readonly _dialogContext = injectBrnDialogContext<{
		caption: string;
		text: string;
		delete: any;
		qrCodeRequested: boolean;
		variant: string;
		singleButtonText?: string;
        singleButtonAction?: any;
	}>();
	protected readonly caption = this._dialogContext.caption;
	protected readonly text = this._dialogContext.text;
	protected readonly delete = this._dialogContext.delete;
	protected readonly variant = this._dialogContext.variant;
	protected readonly qrCodeRequested = this._dialogContext.qrCodeRequested;
	protected readonly singleButtonText = this._dialogContext.singleButtonText;
	protected readonly singleButtonAction = this._dialogContext.singleButtonAction;
	private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);

	constructor(private translate: TranslateService) {}

	cancelText = this.translate.instant('General.cancel');
	deleteText = this.translate.instant('General.delete');

	public closeDialog() {
		this._dialogRef.close();
	}

	public deleteItem() {
		this.delete();
		this._dialogRef.close();
	}

    public clickSingleButton(){
        if(this.singleButtonAction){
            this.singleButtonAction();
        }
        this._dialogRef.close();
    }
}
