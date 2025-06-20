import { Component } from '@angular/core';
import { createCustomElement } from '@angular/elements';

@Component({
	selector: 'wc-test-component',
	template: `
		<section>
			<p>Hello World</p>
		</section>
	`,
})
export class WebComponentTestComponent {}

export default createCustomElement(WebComponentTestComponent, null);
