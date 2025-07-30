import { createWebcomponent } from 'webcomponents/create-webcomponent';
import { VersionComponent } from './version.component';
import { provideHttpClient } from '@angular/common/http';

createWebcomponent(VersionComponent, 'oeb-version', { providers: [provideHttpClient()] });
