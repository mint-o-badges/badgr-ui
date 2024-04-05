import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';

import { Component, Directive } from '@angular/core';
import { FormFieldMarkdown } from './formfield-markdown';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../mocks/mocks.module.spec';
import { FormControl, Validators } from '@angular/forms';

describe('FormFieldMarkdown', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [FormFieldMarkdown],
			imports: [RouterTestingModule, LMarkdownEditorModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(FormFieldMarkdown);
		fixture.componentInstance.control = new FormControl('', Validators.required);
		fixture.detectChanges();
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngAfterViewInit()', async () => {
		const result = component.ngAfterViewInit();
	});

	xit('should run #ngOnChanges()', async () => {
		//asyncconst result = component.ngOnChanges(changes);
	});

	xit('should run #markdownPreview()', async () => {
		//asyncconst result = component.markdownPreview(preview);
	});

	it('should run #updateDisabled()', async () => {
		const result = component.updateDisabled();
	});

	it('should run #openMarkdownHintsDialog()', async () => {
		const result = component.openMarkdownHintsDialog();
	});

	it('should run #unlock()', async () => {
		const result = component.unlock();
	});

	xit('should run #focus()', async () => {
		const result = component.focus();
	});

	xit('should run #select()', async () => {
		const result = component.select();
	});

	xit('should run #cacheControlState()', async () => {
		const result = component.cacheControlState();
	});

	it('should run #postProcessInput()', async () => {
		const result = component.postProcessInput();
	});

	it('should run #handleKeyPress()', async () => {
		const result = component.handleKeyPress({ keyCode: 13 });
	});
});
