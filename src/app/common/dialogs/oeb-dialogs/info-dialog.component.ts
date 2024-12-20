import { Component, HostBinding, Input, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/ui-dialog-brain';
import { OebDialogComponent } from '../../../components/oeb-dialog.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src';
import { HlmIconComponent, HlmIconModule, provideIcons } from '../../../components/spartan/ui-icon-helm/src';
import { HlmH3Directive } from '../../../components/spartan/ui-typography-helm/src';
import { lucideInfo } from '@ng-icons/lucide';
import { NgIf } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';


@Component({
	selector: 'oeb-info-dialog',
	standalone: true,
	imports: [OebDialogComponent, OebButtonComponent, HlmPDirective, HlmH3Directive, HlmIconComponent, NgIf, TranslateModule],
	providers: [TranslateService, provideIcons({ lucideInfo })],
	template: `
		<oeb-dialog [variant]="variant" class="tw-text-center tw-text-oebblack">
			<div class="tw-flex tw-justify-center">
				<div class="oeb-icon-circle tw-my-4">
					<hlm-icon class="tw-text-link" size="xxl" name="lucideInfo" />
				</div>
			</div>
            <h3 hlmH3 class="tw-font-bold !tw-text-black tw-uppercase">
					{{ caption }}
			</h3>
			<div class="tw-flex tw-flex-col tw-gap-2 tw-my-2">
                <p hlmP *ngIf="subtitle">
					{{ subtitle }}
				</p>
				<p hlmP *ngIf="text" class="tw-italic">
					{{ text }}
				</p>
			</div>
			<oeb-button
				(click)="clickSingleButton()"
				size="sm"
				*ngIf="singleButtonText; else TwoButtons"
				[text]="singleButtonText"
			>
			</oeb-button>
			<ng-template #TwoButtons>
				<div class="tw-flex tw-justify-around tw-mt-6">
					<oeb-button size="md" variant="secondary" [text]="cancelText" (click)="cancel()"></oeb-button>
					<oeb-button [id]="'confirm-award-badge'" width="max_content" size="md" class="tw-mr-4" [text]="forwardText" (click)="continue()"></oeb-button>
				</div>
			</ng-template>
		</oeb-dialog>
	`,
})
export class InfoDialogComponent {
	// @HostBinding('class') private readonly _class: string = 'tw-bg-red tw-bg-red';
	private readonly _dialogContext = injectBrnDialogContext<{
		caption: string;
        subtitle: string;
		text: string;
		variant: string;
        cancelText: string;
        forwardText: string;
		singleButtonText?: string;
        singleButtonAction?: any;
	}>();
	protected readonly caption = this._dialogContext.caption;
    protected readonly subtitle = this._dialogContext.subtitle;
	protected readonly text = this._dialogContext.text;
	protected readonly variant = this._dialogContext.variant;
	protected readonly singleButtonText = this._dialogContext.singleButtonText;
    protected readonly cancelText = this._dialogContext.cancelText;
    protected readonly forwardText = this._dialogContext.forwardText;
	protected readonly singleButtonAction = this._dialogContext.singleButtonAction;
	private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);

	constructor(private translate: TranslateService) {}

    public cancel() {
		this._dialogRef.close('cancel');
	}

	public continue() {
		this._dialogRef.close('continue');
	}

    public clickSingleButton(){
        if(this.singleButtonAction){
            this.singleButtonAction();
        }
        this._dialogRef.close();
    }
}
