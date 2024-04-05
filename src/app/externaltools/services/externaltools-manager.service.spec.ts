import { waitForAsync } from '@angular/core/testing';
import { ExternalToolsManager } from './externaltools-manager.service';

describe('ExternalToolsManager', () => {
	let service;

	const externalToolsApiService: any = {
		// mock properties here
	};

	const commonEntityManager: any = {
		// mock properties here
	};

	beforeEach(() => {
		service = new ExternalToolsManager(externalToolsApiService, commonEntityManager);
	});

	it('should run #getToolLaunchpoints()', async () => {
		// const result = getToolLaunchpoints(launchpointName);
	});

	it('should run #getLaunchInfo()', async () => {
		// const result = getLaunchInfo(launchpoint, contextId);
	});
});
