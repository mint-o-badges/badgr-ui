// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import {Component, Directive} from '@angular/core';
import {FormFieldMarkdown} from './formfield-markdown';
import {CommonDialogsService} from '../services/common-dialogs.service';
import {DomSanitizer} from '@angular/platform-browser';
import { RouterTestingModule } from "@angular/router/testing";
import { COMMON_IMPORTS } from "../badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../mocks/mocks.module.spec";
import { BgMarkdownComponent } from "../directives/bg-markdown.component";
import { MarkdownHintsDialog } from "../dialogs/markdown-hints-dialog.component";
import { TruncatedTextComponent } from "./truncated-text.component";
import { FormControl, Validators } from '@angular/forms';

xdescribe('FormFieldMarkdown', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
          FormFieldMarkdown,
          BgMarkdownComponent,
          MarkdownHintsDialog
      ],
      imports: [
          RouterTestingModule,
          CommonModule,
          ...COMMON_IMPORTS,
      ],
      providers: [
          ...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
          //CommonDialogsService,
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
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

  xit('should run #unlock()', async () => {
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
    const result = component.handleKeyPress(event);
  });

});
