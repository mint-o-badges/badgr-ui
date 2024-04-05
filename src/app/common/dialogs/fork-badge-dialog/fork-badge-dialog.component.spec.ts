import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { ForkBadgeDialog, MatchingIssuerBadges, MatchingAlgorithm } from './fork-badge-dialog.component';

import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { COMMON_IMPORTS } from '../../badgr-common.module';

describe('ForkBadgeDialog', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ForkBadgeDialog],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			// Since this is a dialog, not a classical component, this schema has to be used
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(ForkBadgeDialog);
		fixture.detectChanges();
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', () => {
		expect(component).toBeTruthy();
	});
});

describe('MatchingIssuerBadges', () => {
	let badge = new BadgeClass(null);
	let badgeSlug = new BadgeClass(null);
	let badgeOther = new BadgeClass(null);

	let instance: MatchingIssuerBadges;

	beforeAll(() => {
		spyOnProperty(badge, 'issuerSlug').and.returnValue('mySlug');
		spyOnProperty(badgeSlug, 'issuerSlug').and.returnValue('otherSlug');
		spyOnProperty(badgeOther, 'issuerSlug').and.returnValue('mySlug');
	});

	beforeEach(() => {
		instance = new MatchingIssuerBadges('mySlug', 'myName');
	});

	it('should add badges', () => {
		expect(instance.badges).toEqual([]);

		instance.addBadge(badge);
		expect(instance.badges).toEqual([badge]);

		instance.addBadge(badgeOther);
		expect(instance.badges).toEqual([badge, badgeOther]);
	});

	it('should not badges with different issuer slug', () => {
		instance.addBadge(badgeSlug);
		expect(instance.badges).toEqual([]);
	});

	it('should not add badges twice', () => {
		instance.addBadge(badge);
		instance.addBadge(badge);
		expect(instance.badges).toEqual([badge]);
	});
});

describe('MatchingAlgorithm', () => {
	it('should match issuer exactly', () => {
		let issuerMatcher = MatchingAlgorithm.issuerMatcher('Test\\d');
		expect(issuerMatcher('Test1')).toBeTruthy();
	});
	it('should match a part of issuer', () => {
		let issuerMatcher = MatchingAlgorithm.issuerMatcher('Test\\d');
		expect(issuerMatcher('sdfTest12df')).toBeTruthy();
	});
	it('should not match wrong issuer', () => {
		let issuerMatcher = MatchingAlgorithm.issuerMatcher('Test\\d');
		expect(issuerMatcher('TestE')).toBeFalsy();
	});
	it('should not match empty issuer', () => {
		let issuerMatcher = MatchingAlgorithm.issuerMatcher('Test\\d');
		expect(issuerMatcher('')).toBeFalsy();
	});

	it('should match badge exactly', () => {
		let badgeMatcher = MatchingAlgorithm.badgeMatcher('Test\\d');
		let badge = new BadgeClass(null);
		spyOnProperty(badge, 'name').and.returnValue('Test1');
		expect(badgeMatcher(badge)).toBeTruthy();
	});
	it('should match a part of badge', () => {
		let badgeMatcher = MatchingAlgorithm.badgeMatcher('Test\\d');
		let badge = new BadgeClass(null);
		spyOnProperty(badge, 'name').and.returnValue('sdfTest12df');
		expect(badgeMatcher(badge)).toBeTruthy();
	});
	it('should not match wrong badge', () => {
		let badgeMatcher = MatchingAlgorithm.badgeMatcher('Test\\d');
		let badge = new BadgeClass(null);
		spyOnProperty(badge, 'name').and.returnValue('TestE');
		expect(badgeMatcher(badge)).toBeFalsy();
	});
	it('should not match empty badge', () => {
		let badgeMatcher = MatchingAlgorithm.badgeMatcher('Test\\d');
		let badge = new BadgeClass(null);
		spyOnProperty(badge, 'name').and.returnValue('');
		expect(badgeMatcher(badge)).toBeFalsy();
	});
});
