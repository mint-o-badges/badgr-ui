import { Component, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'time[date]',
	template: `{{ inputDate() | date: format() }}`,
	host: {
		'[attr.datetime]': 'datetimeAttr()',
	},
	imports: [DatePipe],
})
export class TimeComponent {
	inputDate = input.required<Date | string | undefined>({ alias: 'date' });
	format = input.required<string>();
	readonly datetimeAttr = computed(() => {
		const d = this.inputDate();
		let date: Date;
		if (typeof d === 'string') date = new Date(d);
		else date = d;

		return d ? date.toISOString().split('T')[0] : undefined;
	});
}
