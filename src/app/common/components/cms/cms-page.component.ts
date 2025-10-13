import { Component, input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CmsApiService } from '../../services/cms-api.service';
import { CmsApiPage, CmsApiPost } from '../../model/cms-api.model';
import { CmsContentComponent } from './cms-content.component';
import { Cms404Component } from './cms-404.component';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
export class CmsPageComponent implements OnInit, OnChanges, OnDestroy {
	apidata: CmsApiPage | CmsApiPost;
	headline: SafeHtml;
	image: string;
	content: SafeHtml;
	type: string;

	slug = input<string>();

	notfound = false;
	languageSubscription: Subscription | null;

	constructor(
		private route: ActivatedRoute,
		protected cmsApiService: CmsApiService,
		protected translate: TranslateService,
		private router: Router,
	) {}

	async setContent(slug: string, type: string) {
		this.type = 'page';
		if (type) {
			this.type = type;
		}
		if (this.type == 'page') {
			this.apidata = await this.cmsApiService.getPageBySlug(slug);
		} else if (this.type == 'post') {
			this.apidata = await this.cmsApiService.getPostBySlug(slug);
		}
		if (this.apidata) {
			if (this.apidata.data && this.apidata.data?.status != 200) {
				this.notfound = true;
			} else {
				this.notfound = false;
				if (this.type == 'post') {
					this.headline = this.apidata.post_title;
					this.image = (this.apidata as CmsApiPost).post_thumbnail;
				}
				this.content = this.apidata.post_content;
			}
		}
	}

	onSlug(slug: string) {
		this.route.data.subscribe(async (data) => {
			this.setContent(slug, data.cmsContentType);
		});
	}

	ngOnInit() {
		let slug = this.slug();
		if (!slug) {
			// ngChanges runs first if property has been set,
			// only check route params if it hasn't
			slug = this.route.snapshot.params['slug'];
			if (slug) {
				this.onSlug(slug);
				if (this.languageSubscription) this.languageSubscription.unsubscribe();
				this.languageSubscription = this.translate.onLangChange.subscribe(() => {
					if (this.apidata && this.apidata.languages[this.translate.currentLang]) {
						this.route.data.subscribe(async (data) => {
							this.router.navigate([
								`/${data.cmsContentType}/${this.apidata.languages[this.translate.currentLang]}`,
							]);
						});
					}
				});
			}
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		let slug = this.slug();
		if (slug && slug != changes['slug']?.previousValue) {
			this.onSlug(slug);
			// destroy language susbcription, parent component sets slug
			if (this.languageSubscription) this.languageSubscription.unsubscribe();
		}
	}

	ngOnDestroy(): void {
		if (this.languageSubscription) this.languageSubscription.unsubscribe();
	}
}
