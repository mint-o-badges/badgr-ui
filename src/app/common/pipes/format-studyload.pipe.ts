import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that formats the studyload of a badge / competency.
 */
@Pipe({ name: 'studyload', })
export class StudyLoadPipe implements PipeTransform {
	transform(studyLoad: number): string {
		return studyLoad > 120 ? Math.floor(studyLoad / 60) + ' Std.' : studyLoad.toString() + ' Min.';
	}
}
