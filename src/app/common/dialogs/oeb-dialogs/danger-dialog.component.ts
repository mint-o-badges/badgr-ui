import { Component, HostBinding, inject } from "@angular/core";
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/ui-dialog-brain";
import { OebDialogComponent } from "../../../components/oeb-dialog.component";
import { OebButtonComponent } from "../../../components/oeb-button.component";
import { HlmPDirective } from "../../../components/spartan/ui-typography-helm/src";
import { HlmIconComponent, HlmIconModule, provideIcons } from "../../../components/spartan/ui-icon-helm/src";
import { lucideAlertTriangle } from '@ng-icons/lucide';
import { NgIf } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: 'oeb-danger-dialog',
    standalone: true,
    imports: [
        OebDialogComponent,
        OebButtonComponent,
        HlmPDirective,
        HlmIconComponent,
        NgIf
    ],
    providers: [TranslateService, provideIcons({ lucideAlertTriangle })],
    template: `
        <oeb-dialog [variant]="variant" class="tw-text-center tw-text-oebblack">
            <div class="tw-flex tw-justify-center">
                <div class="oeb-icon-circle tw-my-6">
                    <hlm-icon class="tw-text-red" size='xxl' name="lucideAlertTriangle" />
                </div>
            </div>
            <p hlmP class="tw-flex tw-flex-col tw-gap-2">
                <span class="tw-font-extrabold tw-uppercase">Qr-Code Vergabe löschen</span>
                <span> Möchtest du die QR-Code Vergabe wirklich löschen? 
                    Damit gehen alle noch offenen Badge-Anfragen verloren.
                </span>
            </p> 
            <div class="tw-flex tw-justify-around tw-mt-6">
            <oeb-button variant="secondary" [text]="cancelText" ></oeb-button>
            <oeb-button class="tw-mr-4" [text]="deleteText" (click)="selectUser()"></oeb-button>
            </div>
        </oeb-dialog>
    `,
})
export class DangerDialogComponent {
    // @HostBinding('class') private readonly _class: string = 'tw-bg-red tw-bg-red';
    private readonly _dialogContext = injectBrnDialogContext<{ text: string, recipient: any, variant: string }>();
    protected readonly text = this._dialogContext.text;
    protected readonly variant = this._dialogContext.variant;
    private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);

    constructor(private translate: TranslateService) {}

    cancelText = this.translate.instant('General.cancel');
    deleteText = this.translate.instant('General.delete');


    public selectUser() {
        this._dialogRef.close();
    }
}