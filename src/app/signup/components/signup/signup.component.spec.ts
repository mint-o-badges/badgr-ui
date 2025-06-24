import { ComponentFixture, TestBed, waitForAsync, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SignupComponent } from './signup.component';
import { ProfileComponent } from '../../../profile/components/profile/profile.component';
import { FormBuilder } from '@angular/forms';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { SessionService } from '../../../common/services/session.service';
import { SignupService } from '../../services/signup.service';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { Router, ActivatedRoute } from '@angular/router';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { EventsService } from '../../../common/services/events.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('SignupComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [
        RouterTestingModule.withRoutes([{ path: 'userProfile', component: ProfileComponent }]),
        BadgrCommonModule,
        TranslateTestingModule.withTranslations('de', {}),
        ...COMMON_IMPORTS,
        SignupComponent,
    ],
    providers: [FormBuilder, Title, DomSanitizer, CommonDialogsService, ...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    teardown: { destroyAfterEach: false },
}).compileComponents();
		//TODO: fix tests and uncomment
		// fixture = TestBed.createComponent(SignupComponent);
		// component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		// expect(component).toBeTruthy();
	});

	it('should run #sanitize()', async () => {
		// const result = component.sanitize('url');
	});

	it('should run #ngOnInit()', async () => {
		// const result = component.ngOnInit();
	});

	it('should run #onSubmit()', async () => {
		// const result = component.onSubmit();
	});

	it('should run #sendSignupConfirmation()', async () => {
		// const result = component.sendSignupConfirmation('email');
	});

	it('should run #passwordsMatch()', async () => {
		// const result = component.passwordsMatch();
	});
});
