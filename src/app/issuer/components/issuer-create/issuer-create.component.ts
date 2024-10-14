import { Component, OnInit } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { UrlValidator } from '../../../common/validators/url.validator';
import { Title } from '@angular/platform-browser';
import { ApiIssuerForCreation } from '../../models/issuer-api.model';
import { SessionService } from '../../../common/services/session.service';
import { preloadImageURL } from '../../../common/util/file-util';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfileEmail } from '../../../common/model/user-profile.model';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { TranslateService } from '@ngx-translate/core';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { IssuerNameValidator } from '../../../common/validators/issuer-name.validator';

@Component({
	selector: 'issuer-create',
	templateUrl: './issuer-create.component.html',
	styleUrls: ['./issuer-create.component.scss'],
})
export class IssuerCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
}
