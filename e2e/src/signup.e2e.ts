import { browser, by, element } from 'protractor';

class SignupPage {
	emailInput = element(by.id('username'));
	firstInput = element(by.id('firstName'));
	lastInput = element(by.id('lastName'));
	passwordInput = element(by.id('password'));
	confirmInput = element(by.id('passwordConfirm'));

	submitButton = element(by.buttonText('Sign Up'));

	open() {
		browser.get('/#/signup');
		browser.refresh();
	}

	signup(email, password = 'secret', first = 'first', last = 'last') {
		this.emailInput.sendKeys(email);
		this.firstInput.sendKeys(first);
		this.lastInput.sendKeys(last);
		this.passwordInput.sendKeys(password);
		this.confirmInput.sendKeys(password);
		this.checkSubmitEnabled();
		return this.submitButton.click();
	}

	checkSubmitDisabled() {
		expect(this.submitButton.getAttribute('class')).toMatch('button-is-disabled');
	}
	checkSubmitEnabled() {
		expect(this.submitButton.getAttribute('class')).not.toMatch('button-is-disabled');
	}

	attemptSignup(email, timeout = 15000, prefix = null) {
		const prefix = prefix || Date.now().toString();
		const test_email = prefix + email;
		this.checkSubmitDisabled();
		this.signup(test_email);

		browser.driver.wait(() => {
			return browser.driver.getCurrentUrl().then((url) => {
				return url == browser.baseUrl + '#/signup/success;email=' + test_email;
			});
		}, timeout);
	}
}

describe('Signup Page', () => {
	const signupPage = new SignupPage();

	it('should signup a user successfully', () => {
		signupPage.open();
		signupPage.attemptSignup('email@test.fake');
	});

	it('should signup a user with + in email', () => {
		signupPage.open();
		signupPage.attemptSignup('email+withplus@test.fake');
	});
});
