import { TestBed } from '@angular/core/testing';
import { OebButtonComponent } from './oeb-button.component';

describe('oeb-button', () => {
	it('should create', () => {
		TestBed.configureTestingModule({ imports: [OebButtonComponent] });
		const fixture = TestBed.createComponent(OebButtonComponent);
		const component = fixture.componentInstance;
		expect(component).toBeDefined();
	});
});
