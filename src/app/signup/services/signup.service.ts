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
		};

		if (source) payload['source'] = source;

		const headers = new HttpHeaders().append('Content-Type', 'application/json').set('Accept', '*/*');

		return this.http
			.post(endpoint, JSON.stringify(payload), {
				observe: 'body',
				responseType: 'json',
				headers,
			})
			.toPromise();
	}
}
