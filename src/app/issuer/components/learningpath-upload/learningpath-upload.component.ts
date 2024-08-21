import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';

@Component({
	selector: 'learningpath-upload',
	templateUrl: './learningpath-upload.component.html',
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
				{ title: 'Issuers', routerLink: ['/issuer'] },
				{ title: issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
                { title: 'Lernpfade' },
				{ title: 'Lernpfad hochladen', routerLink: ['/issuer/issuers', this.issuerSlug, '/learningpaths/upload'] },
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
			const learningPath: ApiLearningPath = JSON.parse(this.rawJson);
			this.learningPathApiService.createLearningPath(this.issuerSlug, learningPath).then((lp) => {	
				this.router.navigate(['/issuer/issuers', this.issuerSlug, 'learningpaths', lp.slug]);
			});
		}
	}

}