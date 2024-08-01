import { Component } from "@angular/core";
import { LinkEntry } from "../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { BadgeClassManager } from "../../services/badgeclass-manager.service";
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { SessionService } from "../../../common/services/session.service";
import { BadgeClass } from "../../models/badgeclass.model";
import { typedFormGroup } from "../../../common/util/typed-forms";
import { Validators } from "@angular/forms";

@Component({
	selector: 'badgeclass-issue-qr',
	templateUrl: './badgeclass-issue-qr.component.html',
})
export class BadgeClassIssueQrComponent extends BaseAuthenticatedRoutableComponent{

    get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	badgeClass: BadgeClass;


	badgeClassLoaded: Promise<unknown>;
    crumbs: LinkEntry[]

    qrForm = typedFormGroup()
        .addControl('title', '', Validators.required)
        .addControl('name', '', Validators.required)
		.addControl('expires', '', this['expirationValidator'])
        
		


    constructor(
        route: ActivatedRoute,
        router: Router,
        sessionService: SessionService,
		protected badgeClassManager: BadgeClassManager,

        ){
            super(router, route, sessionService);

            this.badgeClassLoaded = this.badgeClassManager
				.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
				.then((badgeClass) => {
					this.badgeClass = badgeClass;

					this.crumbs = [
						{ title: 'Issuers', routerLink: ['/issuer'] },
						{
							// title: issuer.name,
                            title: 'issuer',
							routerLink: ['/issuer/issuers', this.issuerSlug],
						},
						{
							title: 'badges',
							routerLink: ['/issuer/issuers/' + this.issuerSlug + '/badges/'],
						},
						{
							title: badgeClass.name,
							routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug],
						},
						{ title: 'Award Badge' },
					];
				});
        

    }

    onSubmit() {
		if (!this.qrForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.qrForm.value;
        this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr', 'generate'], {queryParams: formState});

    }

   
}