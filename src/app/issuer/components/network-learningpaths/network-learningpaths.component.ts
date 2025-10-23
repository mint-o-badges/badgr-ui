import { Component, inject, input, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { LearningPathApiService } from '~/common/services/learningpath-api.service';
import { RouterLink } from '@angular/router';
import { Network } from '~/issuer/network.model';
import { ApiLearningPath } from '~/common/model/learningpath-api.model';
import { BgLearningPathCard } from '~/common/components/bg-learningpathcard';
import { NgClass } from '@angular/common';

@Component({
	selector: 'network-learningpaths',
	templateUrl: './network-learningpaths.component.html',
	imports: [TranslatePipe, OebButtonComponent, RouterLink, BgLearningPathCard, NgClass],
})
export class NetworkLearningPathsComponent implements OnInit {
	constructor() {}
	private learningPathApiService = inject(LearningPathApiService);
	network = input.required<Network>();

	networkLearningPaths: ApiLearningPath[] = [];

	ngOnInit() {
		this.learningPathApiService.getLearningPathsForIssuer(this.network().slug).then((lps) => {
			this.networkLearningPaths = lps;
		});
	}
}
