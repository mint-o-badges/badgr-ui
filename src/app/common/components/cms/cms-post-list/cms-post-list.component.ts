import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CmsApiService } from '../../../services/cms-api.service';
import { CmsApiPost } from '../../../model/cms-api.model';
import { LanguageService } from '../../../services/language.service';

@Component({
	selector: 'cms-post-list',
	templateUrl: './cms-post-list.component.html',
	styleUrls: ['./cms-post-list.component.scss'],
	standalone: false,
})
export class CmsPostListComponent implements OnInit {

	posts: CmsApiPost[] = [];

	constructor(
		protected cmsApiService: CmsApiService,
		public languageService: LanguageService
	) {

	}

	async ngOnInit() {
		this.languageService.getSelectedLngObs().subscribe(async (lang: string) => {
			this.posts = await this.cmsApiService.getPosts();
			//  FIXME: debug
			// this.posts = [...this.posts, ...this.posts, ...this.posts, ...this.posts, ...this.posts]
		});
	}
}
