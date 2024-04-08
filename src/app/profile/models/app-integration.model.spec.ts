import { inject, TestBed } from '@angular/core/testing';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { AppIntegration, BadebookLti1Integration } from './app-integration.model';
import { ApiAppIntegration } from './app-integration-api.model';

describe('AppIntegration', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	it('should be constructable', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { canvasLti1 } = buildTestAppIntegrations();

		AppIntegration.integrationFor(commonManager, canvasLti1);
	}));

	it('should correctly alias fields', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { canvasLti1 } = buildTestAppIntegrations();

		const integration = AppIntegration.integrationFor(commonManager, canvasLti1);
		verifyAppIntegration(integration, canvasLti1);
	}));
});

export function verifyAppIntegration(
	integration: AppIntegration<ApiAppIntegration>,
	apiIntegration: ApiAppIntegration,
) {
	expect(integration.url).toEqual(String(apiIntegration.integrationUid || apiIntegration.integrationType));
	expect(integration.slug).toEqual(integration.url);

	expect(integration.integrationType).toEqual(apiIntegration.integrationType);

	switch (apiIntegration.integrationType) {
		case 'canvas-lti1':
			const canvasIntegration = integration as BadebookLti1Integration;
			expect(canvasIntegration.consumerKey).toEqual(apiIntegration.integrationData['credential'].client_id);
			expect(canvasIntegration.sharedSecret).toEqual(apiIntegration.integrationData['credential'].client_secret);
			expect(canvasIntegration.configUrl).toEqual(apiIntegration.integrationData['credential'].config_url);
			break;
		default:
			break;
	}
}

export function buildTestAppIntegrations() {
	const data: ApiAppIntegration[] = [
		{
			integrationType: 'canvas-lti1',
			integrationData: {
				credential: {
					client_secret: 'f0YM82bj3wx5yqUVE6c4SKWPgIdls1vn',
					client_id: '76449e417be162406e9f29dc570ab4a4',
					configUrl: 'http://localhost/badgr/config',
				},
			},
		},
	];

	return {
		canvasLti1: data[0],
		integrations: data,
	};
}
