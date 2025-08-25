import { Component, input, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgModel, FormsModule } from '@angular/forms';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1 } from '@spartan-ng/helm/typography';
import { HlmP } from '@spartan-ng/helm/typography';
import { NgTemplateOutlet, NgClass, NgStyle } from '@angular/common';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
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
		HlmH1,
		HlmP,
		OebButtonComponent,
		RouterLink,
		NgTemplateOutlet,
		NgIcon,
		HlmIcon,
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
	networks = input.required<Network[]>();
	promise = input.required<Promise<unknown>>();
}
