import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
  } from '@angular/forms';
  import { combineLatest, Observable, of } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  interface ImageValidatorFn {
    (image: HTMLImageElement): ValidationErrors | null;
  }
  
  export function imageAsyncValidator(
    imageValidatorFn: ImageValidatorFn
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
  
      const files: File[] = Array.isArray(control.value)
        ? control.value
        : [control.value];
  
      if (!files) {
        return of(null);
      }
  
      const fileValidation$: Observable<ValidationErrors | null>[] = files.map(
        (file: File) =>
          new Observable<ValidationErrors | null>((observer) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
  
            reader.onload = (event) => {
              const result = event.target?.result;
  
              if (!result) {
                observer.next(null);
                observer.complete();
                return;
              }
  
              const image = new Image();
  
              image.src = result as string;
              image.onload = () => {
                observer.next(imageValidatorFn(image));
                observer.complete();
              };
            };
          })
      );
  
      return combineLatest(fileValidation$).pipe(map(combineValidationErrors));
    };
  }
  
  function combineValidationErrors(
    errors: Array<ValidationErrors | null>
  ): ValidationErrors | null {
    const combinedErrors: ValidationErrors = errors.reduce<ValidationErrors>(
      (acc, curr) => {
        if (curr) {
          return { ...acc, ...curr };
        } else {
          return acc;
        }
      },
      {}
    );
  
    if (Object.keys(combinedErrors).length === 0) {
      return null;
    }
  
    return combinedErrors;
  }
  