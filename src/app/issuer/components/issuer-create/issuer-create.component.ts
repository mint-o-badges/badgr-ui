import { Component } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { IssuerEditFormComponent } from '../issuer-edit-form/issuer-edit-form.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmH1, HlmP } from '@spartan-ng/helm/typography';

@Component({
	selector: 'issuer-create',
	templateUrl: './issuer-create.component.html',
	imports: [FormMessageComponent, HlmH1, HlmP, IssuerEditFormComponent, TranslatePipe],
})
export class IssuerCreateComponent extends BaseAuthenticatedRoutableComponent {}
