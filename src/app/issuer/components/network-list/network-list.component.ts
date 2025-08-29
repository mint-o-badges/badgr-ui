import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HlmP } from '@spartan-ng/helm/typography';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { OebNetworkCard } from '~/common/components/oeb-networkcard.component';
import { Network } from '../../models/network.model';

@Component({
	selector: 'network-list',
	templateUrl: './network-list.component.html',
	imports: [HlmP, OebButtonComponent, RouterLink, FormsModule, TranslatePipe, OebNetworkCard],
})
export class NetworkListComponent {
	networks = input.required<Network[]>();
}
