import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';
import { ApiLearningPathForCreation } from '../../../common/model/learningpath-api.model';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { BadgrApiFailure } from '../../../common/services/api-failure';

@Component({
    selector: 'learningpath-upload',
    templateUrl: './learningpath-upload.component.html',
    standalone: false
})
export class LearningPathUploadComponent extends BaseAuthenticatedRoutableComponent {
    jsonForm: FormGroup;
    issuerSlug: string;
	issuer: Issuer;
	issuerLoaded: Promise<unknown>;

	breadcrumbLinkEntries: LinkEntry[] = [];

    constructor(
		protected formBuilder: FormBuilder,
		protected loginService: SessionService,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected learningPathApiService: LearningPathApiService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected title: Title,
	) {
		super(router, route, loginService);
        this.jsonForm = formBuilder.group({
            file: {}
        })
	    this.issuerSlug = this.route.snapshot.params['issuerSlug'];
        this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
			this.breadcrumbLinkEntries = [
				{ title: 'Meine Institutionen', routerLink: ['/issuer'] },
				{ title: issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
                { title: 'Micro Degrees' },
				{ title: 'Micro Degree hochladen', routerLink: ['/issuer/issuers', this.issuerSlug, '/learningpaths/upload'] },
			];
        });
    }
	readonly csvUploadIconUrl = '../../../../breakdown/static/images/csvuploadicon.svg';

	rawJson: string = null;

    onFileDataReceived(data) {
		this.rawJson = data;
	}


    importAction() {
		if (this.rawJson) {
			const learningPath: ApiLearningPathForCreation = JSON.parse(this.rawJson);
			learningPath["issuer_id"]=this.issuerSlug;
			this.learningPathApiService.createLearningPath(this.issuerSlug, learningPath).then(
				(lp) => {
					this.router.navigate(['/issuer/issuers', this.issuerSlug, 'learningpaths', lp.slug]);
				},
				(error) => {
					this.messageService.setMessage(
						'Micro Degree konnte nicht erstellt werden: ' + BadgrApiFailure.from(error).firstMessage,
						'error',
					);
				},);
		}
	}
}
