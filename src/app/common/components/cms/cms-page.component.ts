import { Component, input, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CmsApiService } from '../../services/cms-api.service';
import { CmsApiPage, CmsApiPost } from '../../model/cms-api.model';
import { CmsContentComponent } from './cms-content.component';

@Component({
	selector: 'cms-page',
	template: `
		<cms-content [headline]="headline" [image]="image" [content]="content" />
	`,
	imports: [
		CmsContentComponent
	],
	standalone: true,
})
export class CmsPageComponent implements OnInit, OnChanges {

	headline: SafeHtml;
	image: string;
	content: SafeHtml;
	type: string;

	slug = input<string>();

	constructor(
		private route: ActivatedRoute,
		protected cmsApiService: CmsApiService,
	) {

	}

	ngOnInit() {
		let slug = this.slug();
		if (!slug) {
			slug = this.route.snapshot.params['slug'];
		}
		if (slug) {
			this.route.data.subscribe(async (data) => {
				this.type = 'page';
				if (data.cmsContentType) {
					this.type = data.cmsContentType;
				}
				let content: CmsApiPage|CmsApiPost;
				if (this.type == 'page') {
					content = await this.cmsApiService.getPageBySlug(slug);
				} else if (this.type == 'post') {
					content = await this.cmsApiService.getPostBySlug(slug);
				}
				console.log(content);
				if (content) {
					if (this.type == 'post') {
						this.headline = content.post_title;
						this.image = (content as CmsApiPost).post_thumbnail;
					}
					this.content = content.post_content;
				}
			});
		}
	}

	// change if @input slug changes for static paths (home, about, faq)
	async ngOnChanges(changes: unknown) {
		if (this.slug() && changes['slug'] && changes['slug'] != this.slug() && this.type) {
			let content: CmsApiPage|CmsApiPost;
			if (this.type == 'page') {
				content = await this.cmsApiService.getPageBySlug(this.slug());
			} else if (this.type == 'post') {
				content = await this.cmsApiService.getPostBySlug(this.slug());
			}
			if (content) {
				if (this.type == 'post') {
					this.headline = content.post_title;
					this.image = (content as CmsApiPost).post_thumbnail;
				}
				this.content = content.post_content;
			}
		}
	}
}
