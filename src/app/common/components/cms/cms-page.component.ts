import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsApiService } from '../../services/cms-api.service';
import { CmsApiPage, CmsApiPost } from '../../model/cms-api.model';
import { AppConfigService } from '../../app-config.service';

@Component({
	selector: 'cms-page',
	template: `
		<cms-content [headline]="headline" [content]="content" />
	`,
	standalone: false,
})
export class CmsPageComponent implements OnInit, OnChanges {

	headline: SafeHtml;
	content: SafeHtml;
	type: string;

	@Input() slug: string;

	constructor(
		private route: ActivatedRoute,
		protected cmsApiService: CmsApiService,
	) {

	}

	ngOnInit() {
		let slug = this.slug;
		if (!slug) {
			slug = this.route.snapshot.params['slug'];
		}
		if (slug) {
			console.log("1: " + slug);
			console.log(this.route)
			this.route.data.subscribe(async (data) => {
				console.log([2, data]);
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
				if (content) {
					this.headline = content.post_title;
					this.content = content.post_content;
				}
			});
		}
	}

	// change if @input slug changes for static paths (home, about, faq)
	async ngOnChanges(changes: unknown) {
		if (this.slug && changes['slug'] && changes['slug'] != this.slug && this.type) {
			let content: CmsApiPage|CmsApiPost;
			if (this.type == 'page') {
				content = await this.cmsApiService.getPageBySlug(this.slug);
			} else if (this.type == 'post') {
				content = await this.cmsApiService.getPostBySlug(this.slug);
			}
			if (content) {
				this.headline = content.post_title;
				this.content = content.post_content;
			}
		}
	}
}
