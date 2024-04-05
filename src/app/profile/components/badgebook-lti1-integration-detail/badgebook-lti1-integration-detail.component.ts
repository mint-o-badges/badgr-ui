import { Component, Input } from '@angular/core';
import { BadebookLti1Integration } from '../../models/app-integration.model';
import { AppIntegrationDetailComponent } from '../app-integration-detail/app-integration-detail.component';
import { SessionService } from '../../../common/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { AppIntegrationManager } from '../../services/app-integration-manager.service';
import { AppConfigService } from '../../../common/app-config.service';

@Component({
	selector: 'badgebook-lti1-detail',
	templateUrl: './badgebook-lti1-integration-detail.component.html',
})
export class BadgebookLti1DetailComponent extends AppIntegrationDetailComponent<BadebookLti1Integration> {
	readonly externalAppsBadgrImageUrl =
		'../../../../breakdown/static/images/screenshots/badgebook-setup/external-apps-badgr.png';
	readonly addAppImageUrl = '../../../../breakdown/static/images/screenshots/badgebook-setup/add-app.png';
	readonly addAppConfigurationTypeUrl =
		'../../../../breakdown/static/images/screenshots/badgebook-setup/add-app-configuration-type.png';

	integrationSlug = 'canvas-lti1';

	constructor(
		loginService: SessionService,
		route: ActivatedRoute,
		router: Router,
		title: Title,
		messageService: MessageService,
		appIntegrationManager: AppIntegrationManager,
		configService: AppConfigService,
	) {
		super(loginService, route, router, title, messageService, appIntegrationManager, configService);
	}
}

@Component({
	selector: '[integration-image]',
	template: ` <a class="integrationthumb" href="javascript: void(0)" (click)="imageClick()" data-index="2">
		<span>{{ caption }}<span> (Open Thumbnail)</span></span>
		<img srcset="{{ imagePath }} 2x" [src]="imagePath" alt="thumbnail description" #addAppConfigurationImage />
	</a>`,
})
export class IntegrationImageComponent {
	imagePath: string;
	private image: HTMLImageElement;

	@Input()
	caption: string;

	@Input('integration-image')
	set inputSrc(src: string) {
		this.imagePath = src;
		this.image = new Image();
		this.image.src = src;
	}

	imageClick() {
		const width = (this.image && this.image.width / 2) || 640;
		const height = (this.image && this.image.height / 2) || 480;

		window.open(this.imagePath, '_blank', `width=${width},height=${height}`);
	}
}
