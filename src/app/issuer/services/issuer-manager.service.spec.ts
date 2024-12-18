import { inject, TestBed } from '@angular/core/testing';
import { AppConfigService } from '../../common/app-config.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { expectRequest, expectRequestAndRespondWith } from '../../common/util/mock-response-util.spec';
import { IssuerApiService } from './issuer-api.service';
import { IssuerManager } from './issuer-manager.service';
import { ApiIssuer, ApiIssuerStaff, ApiIssuerStaffOperation } from '../models/issuer-api.model';
import { apiIssuer1, apiIssuer2, apiIssuer3 } from '../models/issuer.model.spec';
import { verifyEntitySetWhenLoaded, verifyManagedEntitySet } from '../../common/model/managed-entity-set.spec';
import { BadgeClassApiService } from './badgeclass-api.service';
import { BadgeClassManager } from './badgeclass-manager.service';
import { MessageService } from '../../common/services/message.service';
import { SessionService } from '../../common/services/session.service';
import { first } from 'rxjs/operators';

xdescribe('IssuerManager', () => {
	// TODO: Potentially some things still need to be adjusted here.
	// Since the test was disabled anyway, I only adjusted it so much that it compiles; I can't guarantee it also runs correctly.
	let httpMock: HttpClient;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [],
			providers: [
				AppConfigService,
				HttpClientTestingModule,
				MessageService,
				{ provide: 'config', useValue: { api: { baseUrl: '' }, features: {} } },
				SessionService,
				CommonEntityManager,
				IssuerApiService,
				IssuerManager,

				BadgeClassApiService,
				BadgeClassManager,

				MessageService,
			],
			imports: [],
		});

		httpMock = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	it('should retrieve all issuers', inject(
		[IssuerManager, SessionService],
		(issuerManager: IssuerManager, loginService: SessionService) => {
			return Promise.all([
				expectAllIssuersRequest(httpTestingController),
				verifyEntitySetWhenLoaded(issuerManager.issuersList, allApiIssuers),
			]);
		},
	));

	it('should not cause dependent entity managers to make API calls when requesting entity counts', inject(
		[IssuerManager, SessionService],
		(issuerManager: IssuerManager, loginService: SessionService) => {
			return Promise.all([
				expectAllIssuersRequest(httpTestingController),
				verifyEntitySetWhenLoaded(issuerManager.issuersList, allApiIssuers).then((list) => {
					/*list.entities.forEach(issuer => {
								issuer.badgeClassCount;
							});*/
				}),
				httpTestingController.verify(),
			]);
		},
	));

	it('should retrieve issuers on subscription of allIssuers$', inject(
		[IssuerManager, SessionService],
		(issuerManager: IssuerManager, loginService: SessionService) => {
			return Promise.all([
				expectAllIssuersRequest(httpTestingController),
				issuerManager.allIssuers$
					.pipe(first())
					.toPromise()
					.then(() => {
						verifyManagedEntitySet(issuerManager.issuersList, allApiIssuers);
					}),
			]);
		},
	));

	it('should add a new issuer', inject(
		[IssuerManager, SessionService],
		(issuerManager: IssuerManager, loginService: SessionService) => {
			const existingIssuer = apiIssuer1;
			const newIssuer = apiIssuer2;
			const newIssuerForCreation = {
				name: apiIssuer2.name,
				description: apiIssuer2.description,
				image: apiIssuer2.image,
				email: apiIssuer2.json.email,
				url: apiIssuer2.json.url,
				intendedUseVerified: apiIssuer2.intendedUseVerified
			};

			return Promise.all([
				expectAllIssuersRequest(httpTestingController, [existingIssuer]),
				expectRequestAndRespondWith(
					httpTestingController,
					'POST',
					`/v1/issuer/issuers`,
					JSON.stringify(newIssuer),
					201,
				),
				verifyEntitySetWhenLoaded(issuerManager.issuersList, [existingIssuer])
					.then((issuersList) => issuerManager.createIssuer(newIssuerForCreation))
					.then(() => verifyManagedEntitySet(issuerManager.issuersList, [newIssuer, existingIssuer])),
			]);
		},
	));

	it('should handle adding staff members', inject(
		[IssuerManager, SessionService],
		(issuerManager: IssuerManager, loginService: SessionService) => {
			const existingIssuer = apiIssuer1;
			const newStaffMember: ApiIssuerStaff = {
				role: 'staff',
				user: {
					email: 'new@user.com',
					first_name: 'New',
					last_name: 'User',
					agreed_terms_version: 0,
					latest_terms_version: 0,	
				},
			};
			const existingIssuerWithNewUser = {
				...existingIssuer,
				staff: [...existingIssuer.staff, newStaffMember],
			};

			return Promise.all([
				expectAllIssuersRequest(httpTestingController, [existingIssuer]),
				expect(
					expectRequestAndRespondWith(
						httpTestingController,
						'POST',
						`/v1/issuer/issuers/${existingIssuer.slug}/staff`,
						JSON.stringify({ message: 'Success' }),
						200,
					).request.body,
				).toEqual({
					action: 'add',
					email: 'new@user.com',
					role: 'staff',
				}),
				expectRequestAndRespondWith(
					httpTestingController,
					'GET',
					`/v1/issuer/issuers/${existingIssuer.slug}`,
					JSON.stringify(existingIssuerWithNewUser),
					201,
				),
				verifyEntitySetWhenLoaded(issuerManager.issuersList, [existingIssuer])
					.then((issuersList) => issuersList.entities[0].addStaffMember('staff', 'new@user.com'))
					.then((issuer) => {
						expect(issuer.staff.entityForApiEntity(newStaffMember).apiModel).toEqual(newStaffMember);
					}),
			]);
		},
	));

	it('should handle modifying staff members', inject(
		[IssuerManager, SessionService],
		(issuerManager: IssuerManager, loginService: SessionService) => {
			const existingIssuer = apiIssuer1;
			const modifiedStaffMember: ApiIssuerStaff = {
				...existingIssuer.staff.find((s) => s.role === 'staff'),
				role: 'editor',
			};
			const existingIssuerWithModifiedStaff = {
				...existingIssuer,
				staff: [...existingIssuer.staff.filter((s) => s.role !== 'staff'), modifiedStaffMember],
			};

			return Promise.all([
				expectAllIssuersRequest(httpTestingController, [existingIssuer]),
				expect(
					expectRequestAndRespondWith(
						httpTestingController,
						'POST',
						`/v1/issuer/issuers/${existingIssuer.slug}/staff`,
						JSON.stringify({ message: 'Success' }),
						200,
					).request.body,
				).toEqual({
					action: 'modify',
					email: modifiedStaffMember.user.email,
					role: 'editor',
				}),
				expectRequestAndRespondWith(
					httpTestingController,
					'GET',
					`/v1/issuer/issuers/${existingIssuer.slug}`,
					JSON.stringify(existingIssuerWithModifiedStaff),
					201,
				),
				verifyEntitySetWhenLoaded(issuerManager.issuersList, [existingIssuer])
					.then((issuersList) => {
						const member = issuersList.entities[0].staff.entityForApiEntity(modifiedStaffMember);
						member.roleSlug = modifiedStaffMember.role;
						return member.save();
					})
					.then((member) => {
						expect(member.apiModel).toEqual(modifiedStaffMember);
					}),
			]);
		},
	));

	it('should handle deleting staff members', inject(
		[IssuerManager, SessionService],
		(issuerManager: IssuerManager, loginService: SessionService) => {
			const existingIssuer = apiIssuer1;
			const staffMemberToRemove: ApiIssuerStaff = existingIssuer.staff.find((s) => s.role === 'staff');
			const existingIssuerWithoutMember = {
				...existingIssuer,
				staff: [...existingIssuer.staff.filter((s) => s.role !== 'staff')],
			};

			return Promise.all([
				expectAllIssuersRequest(httpTestingController, [existingIssuer]),
				expect(
					expectRequestAndRespondWith(
						httpTestingController,
						'POST',
						`/v1/issuer/issuers/${existingIssuer.slug}/staff`,
						JSON.stringify({ message: 'Success' }),
						200,
					).request.body,
				).toEqual({
					action: 'remove',
					email: staffMemberToRemove.user.email,
				}),
				expectRequestAndRespondWith(
					httpTestingController,
					'GET',
					`/v1/issuer/issuers/${existingIssuer.slug}`,
					JSON.stringify(existingIssuerWithoutMember),
					201,
				),
				verifyEntitySetWhenLoaded(issuerManager.issuersList, [existingIssuer])
					.then((issuersList) =>
						issuersList.entities[0].staff.entityForApiEntity(staffMemberToRemove).remove(),
					)
					.then((issuer) => {
						expect(issuer.staff.entities.map((s) => s.apiModel)).not.toContain(staffMemberToRemove);
					}),
			]);
		},
	));
});

const allApiIssuers = [apiIssuer1, apiIssuer2, apiIssuer3];

function expectAllIssuersRequest(httpTestingController: HttpTestingController, issuers: ApiIssuer[] = allApiIssuers) {
	return expectRequestAndRespondWith(httpTestingController, 'GET', `/v1/issuer/issuers`, JSON.stringify(issuers));
}

export function testIssuerRefForSlug(issuerSlug: string) {
	return {
		'@id': `http://localhost:8000/public/issuers/${issuerSlug}`,
		slug: issuerSlug,
	};
}
