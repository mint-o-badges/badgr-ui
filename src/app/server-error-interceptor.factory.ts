import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServerErrorInterceptor } from './ServerErrorInterceptor';
import { environment } from '../environments/environment';

export function serverErrorInterceptorFactory() {
	return environment.enableErrorInterceptor
		? [
				{
					provide: HTTP_INTERCEPTORS,
					useClass: ServerErrorInterceptor,
					multi: true,
				},
		  ]
		: [];
}
