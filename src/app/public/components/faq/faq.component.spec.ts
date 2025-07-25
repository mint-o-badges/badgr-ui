import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { FaqComponent } from './faq.component';

describe('FaqComponent', () => {
	let component: FaqComponent;
	let fixture: ComponentFixture<FaqComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TranslateTestingModule.withTranslations('de', {}), FaqComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FaqComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
