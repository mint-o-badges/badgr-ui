import { Component } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';

@Component({
    selector: 'issuer-create',
    templateUrl: './issuer-create.component.html',
    standalone: false
})
export class IssuerCreateComponent extends BaseAuthenticatedRoutableComponent {
}
