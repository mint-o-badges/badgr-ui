import { Pipe, PipeTransform } from "@angular/core";
import { MenuItem } from "../components/badge-detail/badge-detail.component.types";
import { CmsApiMenuItem } from "../model/cms-api.model";

@Pipe({ name: 'CmsMenuItems' })
export class CmsMenuItemsPipe implements PipeTransform {
	transform(items: CmsApiMenuItem[]): MenuItem[] {
		return items.map(item => ({
			title: item.title,
			routerLink: [`${item.url}`]
		}));
	}
}
