import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that formats the studyload into hours for learningpaths.
 */
@Pipe({
    name: 'hourPipe'
  })
  export class HourPipe implements PipeTransform {
    transform(value: number): string {
      let hours = Math.floor(value / 60);
      let minutes = Math.floor(value % 60);
    return `${hours}:${String(minutes).padStart(2, '0')} h`  
    }
  }