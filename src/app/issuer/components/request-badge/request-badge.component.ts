import {Component, Input} from '@angular/core';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'request-badge',
    templateUrl: './request-badge.component.html',
})

export class RequestBadgeComponent{
    constructor(private translate: TranslateService) {

    }

    requestBadge = this.translate.instant('RequestBadge.requestBadge');

    requestForm = typedFormGroup()
    .addControl('firstname', '', Validators.required)
    .addControl('lastname', '', Validators.required)
    .addControl('email', '', Validators.required)

    onSubmit() {
		if (!this.requestForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.requestForm.value;
        // this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr', 'generate'], {queryParams: formState});

    }

}