import { ApiEntityRef } from '../../common/model/entity-ref';

export type AppIntegrationType = 'canvas-lti1';

export type ApiAppIntegrationUid = string;

export interface ApiAppIntegrationRef extends ApiEntityRef {}

export interface ApiAppIntegration {
	integrationType: AppIntegrationType;
	integrationUid?: string;

	integrationData: object;
}

export interface ApiBadgebookCanvasLti1AppIntegration extends ApiAppIntegration {
	integrationType: 'canvas-lti1';

	integrationData: {
		credential: {
			client_secret: string;
			client_id: string;
		};
		config_url: string;
	};
}

export function isApiBadgebookCanvasLti1AppIntegration(
	integration: object,
): integration is ApiBadgebookCanvasLti1AppIntegration {
	return integration['integrationType'] === 'canvas-lti1';
}
