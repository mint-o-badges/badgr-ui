import { BadgrConfig } from './badgr-config';

export interface BadgrEnvironment {
	production: boolean;
	enableErrorInterceptor: boolean;
	config?: Partial<BadgrConfig>;
	remoteConfig?: {
		baseUrl: string;
		version: string;
	};
}
