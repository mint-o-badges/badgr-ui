import { Component, Injector, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import { PublicApiLearningPath } from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';

@Component({
	templateUrl: './learningpath.component.html',
})
export class PublicLearningPathComponent {

	learningPathSlug: string;

	learningPathIdParam: LoadedRouteParam<PublicApiLearningPath >;

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		private learningPathApiService: LearningPathApiService,
		private title: Title,
	) {
		title.setTitle(`LearningPath - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.learningPathIdParam = new LoadedRouteParam(injector.get(ActivatedRoute), 'learningPathId', (paramValue) => {
			this.learningPathSlug = paramValue;
			const service: PublicApiService = injector.get(PublicApiService);
			return service.getLearningPath(paramValue);
		});
	}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text: `Du nimmst am Lernpfad ${this.learningPathIdParam.value.name} teil!`,
				variant: 'success',
			},
		});
	}

	participate(){
		this.learningPathApiService.participateInLearningPath(this.learningPathSlug).then(
			(response) => {
				console.log(response);
				this.openSuccessDialog();
			},
			(err) => {
				console.log(err);
			}
		)

	}
}
