import { Component, inject, input, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { LearningPathApiService } from '~/common/services/learningpath-api.service';
import { RouterLink } from '@angular/router';
import { Network } from '~/issuer/network.model';
import { ApiLearningPath } from '~/common/model/learningpath-api.model';
import { BgLearningPathCard } from '~/common/components/bg-learningpathcard';
import { NgClass } from '@angular/common';
import { BgAwaitPromises } from '~/common/directives/bg-await-promises';

@Component({
	selector: 'network-learningpaths',
	templateUrl: './network-learningpaths.component.html',
	imports: [TranslatePipe, OebButtonComponent, RouterLink, BgLearningPathCard, NgClass, BgAwaitPromises],
})
export class NetworkLearningPathsComponent implements OnInit {
	constructor() {}
	private learningPathApiService = inject(LearningPathApiService);
	network = input.required<Network>();
	learningPathsLoaded: Promise<unknown>;

	networkLearningPaths: ApiLearningPath[] = [];

	ngOnInit() {
		this.learningPathsLoaded = this.learningPathApiService
			.getLearningPathsForIssuer(this.network().slug)
			.then((lps) => {
				this.networkLearningPaths = lps;
			});
	}

	calculateStudyLoad(lp: ApiLearningPath): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}
}
