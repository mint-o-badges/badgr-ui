export class SignupModel {
	constructor(
		public username: string,
		public firstName: string,
		public lastName: string,
		public password: string,
		public zipCode: string,
		public agreedTermsService: boolean,
		public marketingOptIn: boolean,
		public captcha: string,
	) {}
}
