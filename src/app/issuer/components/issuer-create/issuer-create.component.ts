import { Component } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { IssuerEditFormComponent } from '../issuer-edit-form/issuer-edit-form.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'issuer-create',
    templateUrl: './issuer-create.component.html',
    imports: [
        FormMessageComponent,
        HlmH1Directive,
        HlmPDirective,
        IssuerEditFormComponent,
        TranslatePipe,
    ],
})
export class IssuerCreateComponent extends BaseAuthenticatedRoutableComponent {}
