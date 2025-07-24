import { Component, input, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CmsApiService } from '../../services/cms-api.service';
import { CmsApiPage, CmsApiPost } from '../../model/cms-api.model';
import { CmsContentComponent } from './cms-content.component';
import { Cms404Component } from './cms-404.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'cms-page',
	template: `
		@if (!notfound) {
			<cms-content [headline]="headline?.toString()" [image]="image" [content]="content?.toString()" />
		} @else {
			<cms-404 />
		}
	`,
	imports: [CmsContentComponent, Cms404Component],
	standalone: true,
})
export class CmsPageComponent implements OnInit, OnChanges {
	headline: SafeHtml;
	image: string;
	content: SafeHtml;
	type: string;

	slug = input<string>();

	notfound = false;

	constructor(
		private route: ActivatedRoute,
		protected cmsApiService: CmsApiService,
		protected translate: TranslateService,
	) {}

	async setContent(slug: string, type: string) {
		this.type = 'page';
		if (type) {
			this.type = type;
		}
		let content: CmsApiPage | CmsApiPost;
		if (this.type == 'page') {
			content = await this.cmsApiService.getPageBySlug(slug);
		} else if (this.type == 'post') {
			content = await this.cmsApiService.getPostBySlug(slug);
		}
		if (content) {
			if (content.data && content.data?.status != 200) {
				this.notfound = true;
			} else {
				this.notfound = false;
				if (this.type == 'post') {
					this.headline = content.post_title;
					this.image = (content as CmsApiPost).post_thumbnail;
				}
				this.content = content.post_content;
			}
		}
	}

	onSlug(slug: string) {
		this.route.data.subscribe(async (data) => {
			this.setContent(slug, data.cmsContentType);
			// TODO: on language change, we should find the corresponding
			// language page slug to the current page, but the API is not
			// providing this information as of now
			// this.translate.onLangChange.subscribe(() => {
			// });
		});
	}

	ngOnInit() {
		let slug = this.slug();
		if (!slug) {
			slug = this.route.snapshot.params['slug'];
		}
		if (slug) {
			this.onSlug(slug);
		}
	}

	ngOnChanges() {
		let slug = this.slug();
		if (slug) {
			this.onSlug(slug);
		}
	}
}
