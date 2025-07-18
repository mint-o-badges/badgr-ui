import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { OebButtonComponent } from './oeb-button.component';
import { By } from '@angular/platform-browser';

describe('oeb-button', () => {
	let fixture: ComponentFixture<OebButtonComponent>;
	let component: OebButtonComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OebButtonComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(OebButtonComponent);
		component = fixture.componentInstance;
		// set any other required @Input()s or initial configuration here
	});

	it('should create with default attributes', () => {
		expect(component).toBeDefined();
		expect(component.disabled()).toBeFalse();
		expect(component.variant()).toBe('default');
		expect(component.size()).toBe('default');
		expect(component.width()).toBe('default');
	});

	it('should disable itself with disabled-when-requesting and loading-promises', fakeAsync(() => {
		// Arrange
		fixture.componentRef.setInput('disabled-when-requesting', true);
		let resolveFn: Function;
		const testPromise = new Promise<void>((resolve) => {
			resolveFn = resolve;
		});

		fixture.componentRef.setInput('loading-promises', [testPromise]);
		fixture.detectChanges();

		// Act: Button should be disabled while the promise is unresolved
		const button = fixture.debugElement.query(By.css('button')).nativeElement;
		const buttonWhilePromiseIsLoading = button.disabled;

		// Resolve the promise
		resolveFn!();
		tick(); // move time forward so promise is resolved
		fixture.detectChanges();
		const buttonAfterPromiseResolved = button.disabled;

		// Assert: Button should be enabled again
		expect(buttonWhilePromiseIsLoading).toBeTrue();
		expect(buttonAfterPromiseResolved).toBeFalse();
	}));

	it('should disable itself with disabled-when-requesting and multiple loading-promises', fakeAsync(() => {
		// Arrange
		fixture.componentRef.setInput('disabled-when-requesting', true);
		let resolveFn1: Function;
		const testPromise1 = new Promise<void>((resolve) => {
			resolveFn1 = resolve;
		});
		let resolveFn2: Function;
		const testPromise2 = new Promise<void>((resolve) => {
			resolveFn2 = resolve;
		});

		fixture.componentRef.setInput('loading-promises', [testPromise1, testPromise2]);
		fixture.detectChanges();

		// Act: Button should be disabled while the promise is unresolved
		const button = fixture.debugElement.query(By.css('button')).nativeElement;
		const buttonWhilePromiseIsLoading = button.disabled;

		// Resolve the promise
		resolveFn1!();
		tick(); // move time forward so promise is resolved
		fixture.detectChanges();
		const buttonAfterPromise1Resolved = button.disabled;
		resolveFn2!();
		tick(); // move time forward so promise is resolved
		fixture.detectChanges();
		const buttonAfterPromise2Resolved = button.disabled;

		// Assert: Button should be enabled again
		expect(buttonWhilePromiseIsLoading).toBeTrue();
		expect(buttonAfterPromise1Resolved).toBeTrue();
		expect(buttonAfterPromise2Resolved).toBeFalse();
	}));

	it('should stay enabled when disabled-when-requesting set and no loading-promises given', () => {
		// Arrange
		fixture.componentRef.setInput('disabled-when-requesting', true);
		fixture.detectChanges();

		// Act: Button should be disabled while the promise is unresolved
		const button = fixture.debugElement.query(By.css('button')).nativeElement;
		const buttonDisabled = button.disabled;

		// Assert: Button should be enabled again
		expect(buttonDisabled).toBeFalse();
	});

	it('should show the loading message when loading-message supplied and loading-promises given', fakeAsync(() => {
		// Arrange
		fixture.componentRef.setInput('text', 'TEXT');
		fixture.componentRef.setInput('loading-message', 'LOADING');

		fixture.detectChanges();
		const button = fixture.nativeElement;
		const textBeforePromise = button.textContent;

		let resolveFn: Function;
		const testPromise = new Promise<void>((resolve) => {
			resolveFn = resolve;
		});
		fixture.componentRef.setInput('loading-promises', [testPromise]);

		// Act: Button should be disabled while the promise is unresolved
		fixture.detectChanges();
		const textDuringPromise = button.textContent;
		// Resolve the promise
		resolveFn!();
		tick(); // move time forward so promise is resolved
		fixture.detectChanges();
		const textAfterPromise = button.textContent;

		// Assert: Button should be enabled again
		expect(textBeforePromise).toContain('TEXT');
		expect(textDuringPromise).toContain('LOADING');
		expect(textAfterPromise).toContain('TEXT');
	}));
});
