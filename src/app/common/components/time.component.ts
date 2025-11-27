import { Component, HostBinding, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'time[date]',
	template: `{{ inputDate() | date }}`,
	host: {
		'[attr.datetime]': 'datetimeAttr()',
	},
	imports: [DatePipe],
})
export class TimeComponent {
	inputDate = input.required<Date>({ alias: 'date' });
	format = input.required<string>();
	readonly datetimeAttr = computed(() => {
		const d = this.inputDate();
		return d.toISOString().split('T')[0];
	});
}
