import { Component, input, Input } from '@angular/core';
import { AppConfigService } from '../../app-config.service';
import { CmsManager } from '../../services/cms-manager.service';
import { ShadowDomComponent } from '../shadow-dom.component';

@Component({
	selector: 'cms-content',
	template: `
	<div class="oeb">
		<div class="tw-overflow-hidden tw-pt-24">
			@if (headline() || image()) {
				<div class="page-padding">
					@if (headline()) {
						<h1 class="tw-text-oebblack ng-tns-c3875192498-0 md:tw-leading-[55.2px] md:tw-text-[46px] tw-leading-[36px] tw-text-[30px]">{{headline()}}</h1>
					}
					@if (image()) {
						<img class="md:tw-w-[100%]" [src]="image()" alt="headline()">
					}
				</div>
			}
			<shadow-dom [content]="_content" [styles]="styles" [script]="configService.apiConfig.baseUrl + '/cms/script'" />
		</div>
	</div>
	`,
	imports: [
		ShadowDomComponent
	],
	standalone: true,
})
export class CmsContentComponent {

	headline = input<string>();
	image = input<string>();
	content = input<string>();
	_content: string

	styles: string;
	styleUrls: string[];

	constructor(
		public configService: AppConfigService,
		private cmsManager: CmsManager,
	) {
		// styles as <style> element
		cmsManager.styles$.subscribe((s) => {
			this.styles = s;
		})
	}

	ngOnChanges() {
		if (this.content()) {
			// make sure styles were loaded first
			this.cmsManager.styles$.subscribe((s) => {
				this._content = `
					${this.content()}
				`;
			});
		}
	}
}
