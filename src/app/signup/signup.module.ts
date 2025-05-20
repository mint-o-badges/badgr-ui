import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SignupSuccessComponent } from './components/signup-success/signup-success.component';
import { SignupComponent } from './components/signup/signup.component';
import { BadgrCommonModule, COMMON_IMPORTS } from '../common/badgr-common.module';
import { SignupService } from './services/signup.service';
import { TranslateModule } from '@ngx-translate/core';

const routes = [
	/* Signup */
	{
		path: '',
		component: SignupComponent,
	},
	{
		path: 'success',
		component: SignupSuccessComponent,
	},
	{
		path: 'success/:email',
		component: SignupSuccessComponent,
	},
	{
		path: '**',
		redirectTo: '',
	},
];

@NgModule({
    imports: [
        ...COMMON_IMPORTS,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        BadgrCommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        SignupComponent, SignupSuccessComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [],
    providers: [SignupService],
})
export class SignupModule {}
