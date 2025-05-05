import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StartComponent } from './start.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('StartComponent', () => {
	let component: StartComponent;
	let fixture: ComponentFixture<StartComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StartComponent],
			imports: [
				...COMMON_IMPORTS,
				BadgrCommonModule,
				RouterTestingModule,
				TranslateTestingModule.withTranslations('de', {}),
			],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(StartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
