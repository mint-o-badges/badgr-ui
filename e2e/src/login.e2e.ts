import { $, browser, by, element, protractor } from 'protractor';

class LoginPage {
	usernameInput = element(by.id('email'));
	passwordInput = element(by.id('password'));
	submitButton = element(by.buttonText('Sign In'));

	open() {
		browser.get('/#/auth');
	}

	login(username, password) {
		this.usernameInput.sendKeys(username);
		this.passwordInput.sendKeys(password);
		this.checkSubmitEnabled();
		return this.submitButton.click();
	}

	checkSubmitDisabled() {
		expect(this.submitButton.getAttribute('class')).toMatch('button-is-disabled');
	}
	checkSubmitEnabled() {
		expect(this.submitButton.getAttribute('class')).not.toMatch('button-is-disabled');
	}
}

describe('Login Page', () => {
	const loginPage = new LoginPage();

	it('should display an error for invalid credentials', () => {
		loginPage.open();

		loginPage.checkSubmitDisabled();

		loginPage.login('incorrect@email.address', 'secret');

		// wait up to 15 seconds for .formmessage to appear
		browser.driver.wait(protractor.until.elementLocated(by.css('.formmessage-is-error')), 15000);

		const message = $('.formmessage-is-error p');
		expect<any>(message.getText()).toEqual('Invalid Email or Password');
	});
});
