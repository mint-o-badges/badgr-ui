import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { Title } from '@angular/platform-browser';

import { AppConfigService } from '../../../common/app-config.service';

@Component({
	selector: 'login',
	template: `
		<main>
			<form-message></form-message>
			<header class="wrap wrap-light l-containerhorizontal l-heading">
				<div class="heading"></div>
			</header>

			<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap"></div>
		</main>
	`,
	standalone: false,
})
export class PublicComponent extends BaseRoutableComponent implements OnInit {
	constructor(
		private title: Title,
		router: Router,
		private configService: AppConfigService,
		route: ActivatedRoute,
	) {
		super(router, route);
		title.setTitle(`Public - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	ngOnInit() {
		super.ngOnInit();
	}
}

/**
 * Generates a router link for a given public-object URL so we can avoid reloading the application when navigating
 * between public objects.
 *
 * @param {string} url
 */
export function routerLinkForUrl(url: string) {
	return [url.replace(/^.*\/\/.*?(?=\/)/, '')];
}
