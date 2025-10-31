import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardApiService } from './dashboard-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { MessageService } from '../../common/services/message.service';
import {
	ApiBadgeStatistics,
	ApiBadgeAwardsResponse,
	ApiSkillsDistribution,
	ApiUserProfile,
} from '../models/dashboard-api.model';

describe('DashboardApiService', () => {
	let service: DashboardApiService;
	let httpMock: HttpTestingController;
	let mockSessionService: jasmine.SpyObj<SessionService>;
	let mockMessageService: jasmine.SpyObj<MessageService>;
	let mockConfigService: jasmine.SpyObj<AppConfigService>;

	const mockBaseUrl = 'https://api.badgr.test';

	beforeEach(() => {
		// Create mock services
		mockSessionService = jasmine.createSpyObj('SessionService', ['isLoggedIn', 'handleAuthenticationError']);
		mockMessageService = jasmine.createSpyObj('MessageService', [
			'incrementPendingRequestCount',
			'decrementPendingRequestCount',
		]);
		mockConfigService = jasmine.createSpyObj('AppConfigService', [], {
			apiConfig: { baseUrl: mockBaseUrl },
		});

		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				DashboardApiService,
				{ provide: SessionService, useValue: mockSessionService },
				{ provide: AppConfigService, useValue: mockConfigService },
				{ provide: MessageService, useValue: mockMessageService },
			],
		});

		service = TestBed.inject(DashboardApiService);
		httpMock = TestBed.inject(HttpTestingController);

		// Set default session state
		Object.defineProperty(mockSessionService, 'isLoggedIn', { get: () => true });
	});

	afterEach(() => {
		httpMock.verify();
	});

	// ==========================================
	// getUserProfile Tests
	// ==========================================

	describe('getUserProfile', () => {
		it('should fetch user profile', async () => {
			const mockProfile: ApiUserProfile = {
				first_name: 'John',
				last_name: 'Doe',
				email: 'john.doe@example.com',
				agreed_terms_version: 1,
				latest_terms_version: 1,
			};

			const promise = service.getUserProfile();

			const req = httpMock.expectOne(`${mockBaseUrl}/v1/user/profile`);
			expect(req.request.method).toBe('GET');
			req.flush(mockProfile);

			const result = await promise;
			expect(result).toEqual(mockProfile);
		});
	});

	// ==========================================
	// getBadgeStatistics Tests
	// ==========================================

	describe('getBadgeStatistics', () => {
		it('should fetch badge statistics', async () => {
			const mockStats: ApiBadgeStatistics = {
				total: 100,
				participation: 40,
				competency: 50,
				learningpath: 10,
			};

			const promise = service.getBadgeStatistics();

			const req = httpMock.expectOne(`${mockBaseUrl}/v1/earner/badge-statistics`);
			expect(req.request.method).toBe('GET');
			req.flush(mockStats);

			const result = await promise;
			expect(result).toEqual(mockStats);
		});
	});

	// ==========================================
	// getBadgeAwards Tests
	// ==========================================

	describe('getBadgeAwards', () => {
		it('should fetch badge awards without filters', async () => {
			const mockAwards: ApiBadgeAwardsResponse = {
				results: [],
				count: 0,
			};

			const promise = service.getBadgeAwards();

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/badges'));
			expect(req.request.method).toBe('GET');
			expect(req.request.params.get('json_format')).toBe('plain');
			req.flush(mockAwards);

			const result = await promise;
			expect(result).toEqual(mockAwards);
		});

		it('should fetch badge awards with year filter', async () => {
			const mockAwards: ApiBadgeAwardsResponse = {
				results: [],
				count: 0,
			};

			const promise = service.getBadgeAwards({ year: 2024 });

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/badges'));
			expect(req.request.params.get('year')).toBe('2024');
			req.flush(mockAwards);

			await promise;
		});

		it('should fetch badge awards with type filter', async () => {
			const mockAwards: ApiBadgeAwardsResponse = {
				results: [],
				count: 0,
			};

			const promise = service.getBadgeAwards({ type: 'competency' });

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/badges'));
			expect(req.request.params.get('type')).toBe('competency');
			req.flush(mockAwards);

			await promise;
		});

		it('should not include type filter when type is "all"', async () => {
			const mockAwards: ApiBadgeAwardsResponse = {
				results: [],
				count: 0,
			};

			const promise = service.getBadgeAwards({ type: 'all' });

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/badges'));
			expect(req.request.params.has('type')).toBe(false);
			req.flush(mockAwards);

			await promise;
		});

		it('should fetch badge awards with pagination', async () => {
			const mockAwards: ApiBadgeAwardsResponse = {
				results: [],
				count: 0,
			};

			const promise = service.getBadgeAwards({ limit: 50, offset: 10 });

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/badges'));
			expect(req.request.params.get('limit')).toBe('50');
			expect(req.request.params.get('offset')).toBe('10');
			req.flush(mockAwards);

			await promise;
		});
	});

	// ==========================================
	// getSkillsDistribution Tests
	// ==========================================

	describe('getSkillsDistribution', () => {
		it('should fetch skills distribution with default language', async () => {
			const mockSkills: ApiSkillsDistribution = {
				skills: [],
				total_skills: 0,
				total_badges_with_skills: 0,
			};

			const promise = service.getSkillsDistribution();

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/skills'));
			expect(req.request.params.get('lang')).toBe('de');
			req.flush(mockSkills);

			const result = await promise;
			expect(result).toEqual(mockSkills);
		});

		it('should fetch skills distribution with custom language', async () => {
			const mockSkills: ApiSkillsDistribution = {
				skills: [],
				total_skills: 0,
				total_badges_with_skills: 0,
			};

			const promise = service.getSkillsDistribution('en');

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/skills'));
			expect(req.request.params.get('lang')).toBe('en');
			req.flush(mockSkills);

			await promise;
		});
	});

	// ==========================================
	// getCollections Tests
	// ==========================================

	describe('getCollections', () => {
		it('should fetch collections', async () => {
			const mockCollections = {
				results: [],
				count: 0,
			};

			const promise = service.getCollections();

			const req = httpMock.expectOne(`${mockBaseUrl}/v1/earner/collections`);
			expect(req.request.method).toBe('GET');
			req.flush(mockCollections);

			const result = await promise;
			expect(result).toEqual(mockCollections);
		});
	});

	// ==========================================
	// getRegionalData Tests
	// ==========================================

	describe('getRegionalData', () => {
		it('should fetch regional data with default region type', async () => {
			const mockRegionalData = {
				regions: [],
				total_regions: 0,
			};

			const promise = service.getRegionalData();

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/regional-data'));
			expect(req.request.params.get('region_type')).toBe('plz');
			req.flush(mockRegionalData);

			const result = await promise;
			expect(result).toEqual(mockRegionalData);
		});
	});

	// ==========================================
	// getActivityFeed Tests
	// ==========================================

	describe('getActivityFeed', () => {
		it('should fetch activity feed with default limit', async () => {
			const mockActivity = {
				results: [],
				count: 0,
			};

			const promise = service.getActivityFeed();

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/activity'));
			expect(req.request.params.get('limit')).toBe('10');
			req.flush(mockActivity);

			const result = await promise;
			expect(result).toEqual(mockActivity);
		});

		it('should fetch activity feed with custom limit', async () => {
			const mockActivity = {
				results: [],
				count: 0,
			};

			const promise = service.getActivityFeed(25);

			const req = httpMock.expectOne((request) => request.url.includes('/v1/earner/activity'));
			expect(req.request.params.get('limit')).toBe('25');
			req.flush(mockActivity);

			await promise;
		});
	});

	// ==========================================
	// Issuer Methods Tests
	// ==========================================

	describe('getIssuerBadgeClasses', () => {
		it('should fetch badge classes for an issuer', async () => {
			const mockBadgeClasses = [{ id: '1', name: 'Test Badge' }];

			const promise = service.getIssuerBadgeClasses('test-issuer');

			const req = httpMock.expectOne(`${mockBaseUrl}/v1/issuer/issuers/test-issuer/badgeclasses`);
			expect(req.request.method).toBe('GET');
			req.flush(mockBadgeClasses);

			const result = await promise;
			expect(result).toEqual(mockBadgeClasses);
		});
	});

	describe('getIssuerAssertions', () => {
		it('should fetch assertions for an issuer', async () => {
			const mockAssertions = [{ id: '1', badge: 'Test Badge' }];

			const promise = service.getIssuerAssertions('test-issuer');

			const req = httpMock.expectOne(`${mockBaseUrl}/v1/issuer/issuers/test-issuer/assertions`);
			expect(req.request.method).toBe('GET');
			req.flush(mockAssertions);

			const result = await promise;
			expect(result).toEqual(mockAssertions);
		});
	});
});
