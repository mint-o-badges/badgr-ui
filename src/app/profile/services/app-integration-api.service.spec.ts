import { waitForAsync } from '@angular/core/testing';
import { AppIntegrationApiService } from './app-integration-api.service';

xdescribe('AppIntegrationApiService', () => {
	let service;

	const loginService: any = {
		// mock properties here
	};

	const http: any = {
		// mock properties here
	};

	const configService: any = {
		// mock properties here
	};

	const messageService: any = {
		// mock properties here
	};

	beforeEach(() => {
		service = new AppIntegrationApiService(loginService, http, configService, messageService);
	});

	it('should run #listIntegratedApps()', async () => {
		// const result = listIntegratedApps();
	});
});
