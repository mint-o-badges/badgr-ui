import { Component, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'time[date]',
	template: `@if (validDateOrNull()) {
		{{ validDateOrNull() | date: format() }}
	}`,
	host: {
		'[attr.datetime]': 'datetimeAttr()',
	},
	imports: [DatePipe],
})
export class TimeComponent {
	inputDate = input<Date | string | null>(undefined, { alias: 'date' });
	validDateOrNull = computed(() => {
		const raw = this.inputDate();
		// This filters out javascripts Invalid Date and returns null instead
		if (raw instanceof Date && isNaN(raw.getTime())) return null;
		else return raw;
	});
	format = input.required<string>();
	readonly datetimeAttr = computed(() => {
		const raw = this.validDateOrNull();
		if (raw === null) return undefined;

		let date: Date | undefined = undefined;
		if (typeof raw === 'string') date = new Date(raw);
		else date = raw;

		if (isNaN(date.getTime()) || date === undefined) return undefined;
		return date.toISOString().split('T')[0];
	});
}
