import { provideHttpClient } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { VersionComponent } from '~/public/components/version.component';

//enableProdMode();

createApplication({ providers: [provideHttpClient()] })
	.then((app) => {
		const versionElement = createCustomElement(VersionComponent, {
			injector: app.injector,
		});

		customElements.define('oeb-version', versionElement);
	})
	.catch((err) => console.error(`Error bootstrapping custom element VersionComponent: ${err}`));
