import { Component, OnInit, inject } from '@angular/core';
import { CmsApiService } from '../../../services/cms-api.service';
import { CmsApiPost } from '../../../model/cms-api.model';
import { LanguageService } from '../../../services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIcon } from '@ng-icons/core';

@Component({
	selector: 'cms-post-list',
	templateUrl: './cms-post-list.component.html',
	styleUrls: ['./cms-post-list.component.scss'],
	standalone: true,
	imports: [TranslateModule, NgIcon],
})
export class CmsPostListComponent implements OnInit {
	protected cmsApiService = inject(CmsApiService);
	languageService = inject(LanguageService);

	posts: CmsApiPost[] = [];

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	async ngOnInit() {
		this.languageService.getSelectedLngObs().subscribe(async (lang: string) => {
			this.posts = await this.cmsApiService.getPosts();
		});
	}
}
