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
	inputDate = input.required<Date | undefined>({ alias: 'date' });
	format = input.required<string>();
	readonly datetimeAttr = computed(() => {
		const d = this.inputDate();
		return d ? d.toISOString().split('T')[0] : undefined;
	});
}
