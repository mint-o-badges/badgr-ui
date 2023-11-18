import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {inject, TestBed} from '@angular/core/testing';
import {AppConfigService} from '../../common/app-config.service';
import {SignupModel} from '../models/signup-model.type';
import {SignupService} from './signup.service';
import {MessageService} from '../../common/services/message.service';
import {SessionService} from '../../common/services/session.service';


xdescribe('SignupService', () => {
    let httpMock: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [  ],
            providers: [
                AppConfigService,
                MessageService,
                SignupService,
                SessionService,
            ],
            imports: [ ]
        });

        // TODO: This should actually be `TestBed.inject...`,
        // but this feature isn't available in the current
        // Angular version yet.
        httpMock = TestBed.get(HttpClient);
        httpTestingController = TestBed.get(HttpTestingController);
    });

	xit("should send signup payload",
		inject([SignupService ], (signupService) => {
            let connection, error, signupModel;

            signupModel = new SignupModel(
                'username@email.com', 'Firstname', 'Lastname', 'password', true, true);
            signupService.submitSignup(signupModel)
            .then(
                () => error = false,
                    () => error = true
            );

            httpTestingController.expectOne(req => true).flush({}, {status: 200});

			expect(error).toBe(false);
		})
	);
});
