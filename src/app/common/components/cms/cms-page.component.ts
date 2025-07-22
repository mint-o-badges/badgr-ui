import { Component, input, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CmsApiService } from '../../services/cms-api.service';
import { CmsApiPage, CmsApiPost } from '../../model/cms-api.model';
import { CmsContentComponent } from './cms-content.component';
import { Cms404Component } from './cms-404.component';

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
export class CmsPageComponent implements OnInit {
	headline: SafeHtml;
	image: string;
	content: SafeHtml;
	type: string;

	slug = input<string>();

	notfound = false;

	constructor(
		private route: ActivatedRoute,
		protected cmsApiService: CmsApiService,
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

	ngOnInit() {
		let slug = this.slug();
		if (!slug) {
			slug = this.route.snapshot.params['slug'];
		}
		if (slug) {
			this.route.data.subscribe(async (data) => {
				this.setContent(slug, data.cmsContentType);
			});
		}
	}
}
