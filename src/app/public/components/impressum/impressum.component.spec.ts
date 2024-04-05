import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';

import { ImpressumComponent } from './impressum.component';

describe('ImpressumComponent', () => {
	let component: ImpressumComponent;
	let fixture: ComponentFixture<ImpressumComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ImpressumComponent],
			imports: [...COMMON_IMPORTS, BadgrCommonModule, TranslateTestingModule.withTranslations('de', {})],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImpressumComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
