
import { SignupSuccessComponent } from './components/signup-success/signup-success.component';
import { SignupComponent } from './components/signup/signup.component';

export const routes = [
	/* Signup */
	{
		path: '',
		component: SignupComponent,
	},
	{
		path: 'success',
		component: SignupSuccessComponent,
	},
	{
		path: 'success/:email',
		component: SignupSuccessComponent,
	},
	{
		path: '**',
		redirectTo: '',
	},
];