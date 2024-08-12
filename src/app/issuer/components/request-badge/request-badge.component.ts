import {Component, Input, inject} from '@angular/core';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BadgeRequestApiService } from '../../services/badgerequest-api.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { HlmDialogService } from './../../../components/spartan/ui-dialog-helm/src';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';


@Component({
    selector: 'request-badge',
    templateUrl: './request-badge.component.html',
})

export class RequestBadgeComponent extends BaseRoutableComponent{
    constructor(
        private translate: TranslateService,
        private badgeRequestApiService: BadgeRequestApiService,
		protected badgeManager: BadgeClassManager,
        router: Router,
		route: ActivatedRoute,
    ) {
        super(router, route);
        this.badgeClassLoaded = this.badgeManager.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug).then((badge) => {
            this.badgeClass = badge;
    })
    }

    readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';

    private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
                text: this.translate.instant('RequestBadge.successMessage') + this.translate.instant('RequestBadge.successMessage2'),
				variant: "success"
			},
		});
	}

    get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

    get qrSlug() {
		return this.route.snapshot.params['qrCodeId'];
	}

	badgeClassLoaded: Promise<unknown>;
	badgeClass: BadgeClass;



    get issuerSlug() {
        return this.route.snapshot.params['issuerSlug'];
    }

    ngOnInit(): void {
        this.requestForm.setValue({
            ...this.requestForm.value,
            qrCodeId: this.qrSlug
        })
    }

    requestBadge = this.translate.instant('RequestBadge.requestBadge');

    requestForm = typedFormGroup()
    .addControl('firstname', '', Validators.required)
    .addControl('lastname', '', Validators.required)
    .addControl('email', '', Validators.required)
    .addControl('qrCodeId', '', Validators.required)
    .addControl('ageConfirmation', false, Validators.requiredTrue)

    onSubmit() {
		if (!this.requestForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.requestForm.value;

        this.badgeRequestApiService.requestBadge(this.qrSlug, JSON.stringify(formState)).then((response) => {
            if(response.ok){
                this.openSuccessDialog();
                // TODO: check if this is correct 
                this.router.navigate(['/catalog/badges']);

            }
        })


    }

}