import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that uppercases the first letter of a string.
 */
@Pipe({
    name: 'ucfirst',
    standalone: false
})
export class UcFirstPipe implements PipeTransform {
	transform(value: string) {
		return value.slice(0, 1).toUpperCase() + value.slice(1);
	}
}
