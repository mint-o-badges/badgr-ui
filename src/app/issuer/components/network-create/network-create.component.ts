import { Component } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { NetworkEditFormComponent } from '../network-edit-form/network-edit-form.comonent';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'network-create',
	templateUrl: './network-create.component.html',
	imports: [FormMessageComponent, HlmH1Directive, HlmPDirective, NetworkEditFormComponent, TranslatePipe],
})
export class NetworkCreateComponent extends BaseAuthenticatedRoutableComponent {}
