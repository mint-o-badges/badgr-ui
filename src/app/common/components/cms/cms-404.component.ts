import { Component, input, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CmsApiService } from '../../services/cms-api.service';
import { CmsApiPage, CmsApiPost } from '../../model/cms-api.model';
import { CmsContentComponent } from './cms-content.component';

@Component({
	selector: 'cms-404',
	template: `
		<div class="oeb">
			<div class="tw-overflow-hidden tw-pt-24">
				<div class="page-padding">
					<h1>404</h1>
					<p>Page not found</p>
				</div>
			</div>
		</div>
	`,
	styles: `
		h1 {
			font-size: 64px;
			line-height: 1.2em;
		}
		p {
			font-size: 24px;
			line-height: 1.2em;
		}
	`,
	standalone: true,
})
export class Cms404Component {}
