import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, catchError, throwError, of } from 'rxjs';
import { ErrorDialogComponent } from './common/dialogs/oeb-dialogs/error-dialog.component';
import { HlmDialogService } from './components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
    private readonly _hlmDialogService = inject(HlmDialogService);
    
    private knownErrors = [
      {
        status: 400,
        name: "DUPLICATE_BADGE",
        description: "You already have this badge in your backpack",
      },
      {
        status: 400,
        error: "invalid_grant",
        errorDescription: "Invalid credentials given.",
      },
    ];
    constructor() {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const baseUrl = this.getBaseUrl();
  
      return next.handle(req).pipe(
        catchError((error: any) => {
          if (this.shouldIgnoreError(error)) {
            return of(); 
          }
  
          if (this.isServerError(error, baseUrl)) {
            this._hlmDialogService.open(ErrorDialogComponent, {
              context: {
                error: error,
              },
            });
          }
          return throwError(() => error);
        })
      );
    }

  private getBaseUrl(): string {
    const config = localStorage.getItem('config');
    if (config) {
      try {
        const parsedConfig = JSON.parse(config);
        return parsedConfig.api?.baseUrl || '';
      } catch {
        console.error('Faulty config in local storage. Unabel to retrieve baseUrl.');
      }
    }
    return '';
  }

  private isServerError(error: any, baseurl: string): boolean {
    return (
      error instanceof HttpErrorResponse &&
      error.url?.startsWith(baseurl) 
    );
  }

  // Helper function to decide which error should be ignored 
  // some errors are already catched by  BadgrApiFailure class


  private shouldIgnoreError(error: any): boolean {
    console.log(error?.error);
  
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }
  
    // Prüfen, ob der Fehler ein Array ist
    if (Array.isArray(error.error)) {
      return error.error.some((err: any) =>
        this.knownErrors.some(
          (knownError) =>
            error.status === knownError.status &&
            err.name === knownError.name &&
            (!knownError.description || err.description === knownError.description)
        )
      );
    }
  
    // Prüfen, ob der Fehler ein Objekt ist
    return this.knownErrors.some(
      (knownError) =>
        error.status === knownError.status &&
        error.error?.error === knownError.error &&
        error.error?.error_description === knownError.errorDescription
    );
  }

}
