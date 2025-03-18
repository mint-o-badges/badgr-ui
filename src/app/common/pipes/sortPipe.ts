import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'sort',
    standalone: false
})
export class SortPipe implements PipeTransform {
  transform(array: any[], params: {key?: string, inplace?: boolean} = {}): any[] {
		if (!array) return [];
		// deep copy by default
		if (!params.inplace) {
			array = JSON.parse(JSON.stringify(array));
		}
		if (params.key) {
			return array.sort((a, b) => {
				return a[params.key].localeCompare(b[params.key]);
			});
		} else {
			return array.sort();
		}
  }
}
