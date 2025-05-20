import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AppConfigService } from '../../app-config.service';
import { CmsApiService } from '../../services/cms-api.service';
import { CmsManager } from '../../services/cms-manager.service';

@Component({
	selector: 'cms-content',
	template: `
	<div class="oeb">
		<div class="tw-overflow-hidden tw-pt-24">
			<shadow-dom [content]="_content" [styles]="styles" [script]="configService.apiConfig.baseUrl + '/cms/script'" />
		</div>
	</div>
	`,
	standalone: false,
})
export class CmsContentComponent {

	@Input() headline: string;
	@Input() content: string;
	_content: string

	styles: string;
	styleUrls: string[];

	constructor(
		public configService: AppConfigService,
		private cmsManager: CmsManager,
	) {
		// styles for <link> elements
		// this.styleUrls = [
		// 	`${this.configService.apiConfig.baseUrl}/cms/style`
		// ];

		// styles as <style> element
		cmsManager.styles$.subscribe((s) => {
			this.styles = s;
		})
	}

	ngOnChanges() {
		if (this.content) {
			// make sure styles were loaded first
			this.cmsManager.styles$.subscribe((s) => {
				this._content = `
					${this.content}
				`;
			});
		}
	}
}
