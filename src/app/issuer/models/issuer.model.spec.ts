import { inject, TestBed } from '@angular/core/testing';
import { Issuer } from './issuer.model';
import { ApiIssuer } from './issuer-api.model';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';

describe('Issuer', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	it('should be constructable', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const i = new Issuer(commonManager);
	}));

	it('should correctly alias fields', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		[apiIssuer1, apiIssuer2, apiIssuer3].forEach((apiIssuer) => {
			const issuer = new Issuer(commonManager, apiIssuer);
			verifyIssuer(issuer, apiIssuer);
		});
	}));
});

export function verifyIssuer(issuer: Issuer, apiIssuer: ApiIssuer) {
	expect(issuer.issuerUrl).toEqual(apiIssuer.json.id);
	expect(issuer.slug).toEqual(apiIssuer.slug);
	expect(issuer.name).toEqual(apiIssuer.name);
	expect(issuer.description).toEqual(apiIssuer.description);
	expect(issuer.image).toEqual(apiIssuer.image);
	expect(issuer.email).toEqual(apiIssuer.json.email);
	expect(issuer.websiteUrl).toEqual(apiIssuer.json.url);
	expect(issuer.createdAt).toEqual(new Date(apiIssuer.created_at));
	expect(issuer.staff.entities.map((s) => s.apiModel)).toEqual(apiIssuer.staff);
}

export const apiIssuer1 = {
	created_at: '2016-03-30T05:55:37Z',
	json: {
		description: 'A test issuer for a hypothetical high school civics course',
		url: 'http://test.fake',
		image: 'https://badgr.io/public/issuers/american-civics-2016/image',
		email: 'issuer1+test@test.fake',
		'@context': 'https://w3id.org/openbadges/v1',
		type: 'Issuer',
		id: 'https://badgr.io/public/issuers/american-civics-2016',
		name: 'American Civics 2016',
	},
	name: 'American Civics 2016',
	slug: 'american-civics-2016',
	image: 'http://localhost:8000/media/uploads/issuers/issuer_logo_506b6e59-eb43-467f-8103-54853e083358.png',
	created_by: 'https://badgr.io/user/568',
	description: 'A test issuer for a hypothetical high school civics course',
	staff: [
		{
			role: 'owner',
			user: {
				first_name: 'Owner',
				last_name: 'Person',
				email: 'owner@person.email',
				url: 'owner.url',
			},
		},
		{
			role: 'editor',
			user: {
				first_name: 'Editor',
				last_name: 'Person',
				email: 'editor@person.email',
				url: 'editor.url',
			},
		},
		{
			role: 'staff',
			user: {
				first_name: 'Staff',
				last_name: 'Person',
				email: 'staff@person.email',
				url: 'staff.url',
			},
		},
	],
} as ApiIssuer;

export const apiIssuer2 = {
	created_at: '2015-11-18T05:03:46Z',
	json: {
		description: 'A US Government and History Course for Middle Schoolers',
		url: 'http://concentricsky.com',
		image: 'https://badgr.io/public/issuers/middle-school-civics/image',
		email: 'hello@concentricsky.com',
		'@context': 'https://w3id.org/openbadges/v1',
		type: 'Issuer',
		id: 'https://badgr.io/public/issuers/middle-school-civics',
		name: 'Middle School Civics',
	},
	name: 'Middle School Civics',
	slug: 'middle-school-civics',
	image: 'http://localhost:8000/media/uploads/issuers/issuer_logo_43f60f2f-9adb-4876-b74c-34da22db907d.png',
	created_by: 'https://badgr.io/user/1',
	description: 'A US Government and History Course for Middle Schoolers',
	staff: [
		{
			role: 'owner',
			user: {
				first_name: 'Owner',
				last_name: 'Person',
				email: 'owner@person.email',
				url: 'owner.url',
			},
		},
		{
			role: 'editor',
			user: {
				first_name: 'Editor',
				last_name: 'Person',
				email: 'editor@person.email',
				url: 'editor.url',
			},
		},
		{
			role: 'staff',
			user: {
				first_name: 'Staff',
				last_name: 'Person',
				email: 'staff@person.email',
				url: 'staff.url',
			},
		},
	],
} as ApiIssuer;

export const apiIssuer3 = {
	created_at: '2015-11-17T23:35:34Z',
	json: {
		description: 'Issuer of badges that rock!',
		url: 'http://www.someurl.com',
		image: 'https://badgr.io/public/issuers/rockin-badges/image',
		email: 'someone@someurl.com',
		'@context': 'https://w3id.org/openbadges/v1',
		type: 'Issuer',
		id: 'https://badgr.io/public/issuers/rockin-badges',
		name: "Rockin' Badges",
	},
	name: "Rockin' Badges",
	slug: 'rockin-badges',
	image: 'http://localhost:8000/media/uploads/issuers/issuer_logo_347eea4c-0e67-4404-9f7e-1a4c0ce346d1.png',
	created_by: 'https://badgr.io/user/110',
	description: 'Issuer of badges that rock!',
	staff: [
		{
			role: 'owner',
			user: {
				first_name: 'Owner',
				last_name: 'Person',
				email: 'owner@person.email',
				url: 'owner.url',
			},
		},
		{
			role: 'editor',
			user: {
				first_name: 'Editor',
				last_name: 'Person',
				email: 'editor@person.email',
				url: 'editor.url',
			},
		},
		{
			role: 'staff',
			user: {
				first_name: 'Staff',
				last_name: 'Person',
				email: 'staff@person.email',
				url: 'staff.url',
			},
		},
	],
} as ApiIssuer;
