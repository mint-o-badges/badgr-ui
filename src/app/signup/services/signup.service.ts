import { Injectable } from '@angular/core';
import { AppConfigService } from '../../common/app-config.service';
import { SignupModel } from '../models/signup-model.type';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SignupService {
	baseUrl: string;

	constructor(
		private http: HttpClient,
		private configService: AppConfigService,
	) {
		this.baseUrl = this.configService.apiConfig.baseUrl;
	}

	submitSignup(signupModel: SignupModel, source: string) {
		const endpoint = this.baseUrl + '/v1/user/profile';
		const payload = {
			email: signupModel.username,
			first_name: signupModel.firstName,
			last_name: signupModel.lastName,
			password: signupModel.password,
			agreed_terms_service: signupModel.agreedTermsService,
			marketing_opt_in: signupModel.marketingOptIn,
			captcha: signupModel.captcha,
		};

		if (source) payload['source'] = source;

		const headers = new HttpHeaders().append('Content-Type', 'application/json').set('Accept', '*/*');

		// if(signupModel.marketingOptIn){
		// 	const formData = new FormData();
		// 	formData.append('EMAIL', signupModel.username);
		// 	formData.append('VORNAME', signupModel.firstName);
		// 	formData.append('NACHNAME', signupModel.lastName);
		// 	formData.append('OPT_IN', '1');
		// 	formData.append('email_address_check', '');

		// 	return this.http.post('https://2b1b89e9.sibforms.com/serve/MUIFALKzbfP1ewV7BIhHDOki43AU-M9xs7TR_w_yGhcocjTC-UU37s1NOUtpT1NNtMGMdPdPyRhHIOo6QML2xLqzecNQXTyu6DZrkUYSN0ZX_fUmS9djk28bIbK23BDJWf-0fLlY7UAW0QQR7a9ShjcL5POuKBVyTOiT9BYQ9aNuKoSw4o0vPfsqKFfsTAjbiUdYnIHHrn8KKRPc',
		// 	formData
		// 	).toPromise()
		// }
		return this.http
			.post(endpoint, JSON.stringify(payload), {
				observe: 'body',
				responseType: 'json',
				headers,
			})
			.toPromise();
	}
}
