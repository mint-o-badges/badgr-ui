import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class Destroy extends Observable<void> implements OnDestroy {
  private readonly destroySubject$ = new ReplaySubject<void>(1);

  constructor() {
    super((subscriber) => this.destroySubject$.subscribe(subscriber));
  }

  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
}
