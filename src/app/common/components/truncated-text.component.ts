import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: '[truncatedText]',
    host: {
        '[title]': 'rawText',
    },
    template: `{{ processedText }}`,
})
export class TruncatedTextComponent implements OnChanges {
	@Input('truncatedText')
	rawText: string;

	@Input()
	maxLength = 100;

	processedText: string;

	ngOnChanges(changes: SimpleChanges): void {
		if (this.rawText) {
			if (this.rawText.length > this.maxLength) {
				this.processedText =
					this.rawText.substring(0, this.maxLength).replace(/[\s,.;:][^\s,.;:]{0,20}$/, '') + // Remove trailing partial words
					'…';
			} else {
				this.processedText = this.rawText;
			}
		} else {
			this.processedText = '';
		}
	}
}
