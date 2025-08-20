import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgModel, FormsModule } from '@angular/forms';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { NgTemplateOutlet, NgClass, NgStyle } from '@angular/common';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';
import { BgImageStatusPlaceholderDirective } from '../../../common/directives/bg-image-status-placeholder.directive';
import { OebTabsComponent } from '../../../components/oeb-tabs.component';
import { OebNetworkCard } from '~/common/components/oeb-networkcard.component';
import { Network } from '../../models/network.model';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';

@Component({
	selector: 'network-list',
	templateUrl: './network-list.component.html',
	imports: [
		FormMessageComponent,
		HlmH1Directive,
		HlmPDirective,
		OebButtonComponent,
		RouterLink,
		NgTemplateOutlet,
		NgIcon,
		HlmIconDirective,
		BgImageStatusPlaceholderDirective,
		NgClass,
		FormsModule,
		NgStyle,
		TranslatePipe,
		OebTabsComponent,
		OebNetworkCard,
		BgAwaitPromises,
	],
})
export class NetworkListComponent {
	@Input() networks: Network[];
	@Input() promise: Promise<unknown>;

	ngOnInit() {
		console.log('networks', this.networks);
	}
}
