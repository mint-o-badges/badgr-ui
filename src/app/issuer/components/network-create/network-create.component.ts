import { Component } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { NetworkEditFormComponent } from '../network-edit-form/network-edit-form.comonent';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmH1 } from '@spartan-ng/helm/typography';
import { HlmP } from '@spartan-ng/helm/typography';

@Component({
	selector: 'network-create',
	templateUrl: './network-create.component.html',
	imports: [FormMessageComponent, HlmH1, HlmP, NetworkEditFormComponent, TranslatePipe],
})
export class NetworkCreateComponent extends BaseAuthenticatedRoutableComponent {}
