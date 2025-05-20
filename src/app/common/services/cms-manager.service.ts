import { Injectable } from '@angular/core';
import { CmsApiService } from './cms-api.service';
import { Observable } from 'rxjs';
import { UpdatableSubject } from '../util/updatable-subject';
import { CmsApiMenu } from '../model/cms-api.model';

@Injectable()
export class CmsManager {
	_menus = new UpdatableSubject<CmsApiMenu>(() => {
		this.cmsApiService.getMenus().then(m => {
			this._menus.safeNext(m);
		});
	});
	_styles = new UpdatableSubject<string>(() => {
		this.cmsApiService.getStyles().then(s => {
			this._styles.safeNext(s);
		});
	});

	constructor(
		public cmsApiService: CmsApiService,
	) {}

	get menus$(): Observable<CmsApiMenu> {
		return this._menus.asObservable();
	}
	get styles$(): Observable<string> {
		return this._styles.asObservable();
	}
}
