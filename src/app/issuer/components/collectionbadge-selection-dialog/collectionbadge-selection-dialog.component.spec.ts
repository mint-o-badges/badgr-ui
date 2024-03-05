import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionBadgeSelectionDialog } from "./collectionbadgebadge-selection-dialog.component";
import { RouterTestingModule } from "@angular/router/testing";
import { BadgrCommonModule, COMMON_IMPORTS } from "../../../common/badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";
import { FormsModule } from "@angular/forms";

describe('CollectionBadgeSelectionDialogComponent', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        CollectionBadgeSelectionDialog
      ],
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				FormsModule,
				...COMMON_IMPORTS,
			],
			providers: [
				...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
			],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
    fixture = TestBed.createComponent(CollectionBadgeSelectionDialog);
    component = fixture.debugElement.componentInstance;
		component.resolveFunc = () => {};
		component.open = false;
		component.close = () => {};
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  xit('should run #openDialog()', async () => {
    // const result = component.openDialog({ dialogId, dialogTitle, omittedCollection });
  });

  it('should run #cancelDialog()', async () => {
    const result = component.cancelDialog();
  });

  it('should run #saveDialog()', async () => {
    const result = component.saveDialog();
  });

  xit('should run #updateData()', async () => {
    const result = component.updateData();
  });

  xit('should run #updateCollection()', async () => {
    // const result = component.updateCollection(checkedCollection, checked);
  });

  it('should run #applySorting()', async () => {
    const result = component.applySorting();
  });

  xit('should run #updateResults()', async () => {
    const result = component.updateResults();
  });

});
