import { Component, HostBinding, inject } from "@angular/core";
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/ui-dialog-brain";
import { OebDialogComponent } from "../../../components/oeb-dialog.component";
import { HlmPDirective } from "../../../components/spartan/ui-typography-helm/src";
import { HlmIconComponent, HlmIconModule, provideIcons } from "../../../components/spartan/ui-icon-helm/src";
import { lucideCheck } from '@ng-icons/lucide';

@Component({
    selector: 'oeb-success-dialog',
    standalone: true,
    imports: [
        OebDialogComponent,
        HlmPDirective,
        HlmIconComponent
    ],
    providers: [provideIcons({ lucideCheck })],
    template: `
        <oeb-dialog [variant]="variant" class="tw-text-center tw-text-purple"><div class="tw-flex tw-justify-center"><div class="oeb-icon-circle tw-my-6"><hlm-icon size='xxl' name="lucideCheck" /></div></div><p hlmP class="tw-text-purple">Der Badge wurde erfolgreich an <span class="tw-font-bold">{{recipient}}</span> vergeben.</p></oeb-dialog>
    `,
})
export class SuccessDialogComponent {
    // @HostBinding('class') private readonly _class: string = 'tw-bg-red tw-bg-red';
    private readonly _dialogContext = injectBrnDialogContext<{ recipient: any, variant: string }>();
    protected readonly recipient = this._dialogContext.recipient;
    protected readonly variant = this._dialogContext.variant;
    private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);


    public selectUser() {
        this._dialogRef.close();
    }
}