import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Component that displays a date in a <time> element and minimizes the number of calls to the DatePipe, which is very
 * slow.
 */
@Component({
	selector: 'time[date]',
	host: {
		datetime: '{{ htmlDateStr }}',
	},
	template: `{{ userDateStr }}`,
})
export class TimeComponent implements OnChanges {
	static datePipe = new DatePipe('en-US');

	@Input()
	date: Date;

	@Input()
	format: string;

	htmlDateStr = '';
	userDateStr = '';

	ngOnChanges(changes: SimpleChanges): void {
		if ('date' in changes || 'format' in changes) {
			this.update();
		}
	}

	update() {
		if (this.date) {
			this.htmlDateStr = TimeComponent.datePipe.transform(this.date, 'yyyy-MM-dd');
			this.userDateStr = TimeComponent.datePipe.transform(this.date, this.format || 'medium');
		} else {
			this.htmlDateStr = '';
			this.userDateStr = '';
		}
	}
}
