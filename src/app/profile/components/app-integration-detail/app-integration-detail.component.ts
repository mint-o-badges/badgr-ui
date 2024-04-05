import { OnInit, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { AppIntegration } from '../../models/app-integration.model';
import { AppIntegrationManager } from '../../services/app-integration-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { ApiAppIntegration } from '../../models/app-integration-api.model';

@Injectable()
export abstract class AppIntegrationDetailComponent<T extends AppIntegration<ApiAppIntegration>>
	extends BaseAuthenticatedRoutableComponent
	implements OnInit
{
	integration: T;
	integrationPromise: Promise<unknown>;
	abstract integrationSlug: string;

	constructor(
		loginService: SessionService,
		route: ActivatedRoute,
		router: Router,

		private title: Title,
		private messageService: MessageService,
		private appIntegrationManager: AppIntegrationManager,
		private configService: AppConfigService,
	) {
		super(router, route, loginService);
		title.setTitle(`App Integrations - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.integrationPromise = appIntegrationManager.appIntegrations.loadedPromise.then((list) => {
			this.integration = list.entityForSlug(this.integrationSlug) as any;

			if (!this.integration) {
				throw new Error(`Failed to load integration ${this.integrationSlug}`);
			}
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}
}
