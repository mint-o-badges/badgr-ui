import { Directive } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryParametersService } from '../../../common/services/query-parameters.service';

@Directive({
	selector: '[sourceListener]',
	standalone: false,
})
export class SourceListenerDirective {
	getVars = ['signup', 'source'];
	getVarSets = ['assertion'];

	constructor(
		private route: ActivatedRoute,
		private queryParams: QueryParametersService,
	) {}

	ngOnInit() {
		this.getVars.forEach((gv) => this.varSet(gv));
		this.getVarSets.forEach((gv) => this.varPush(gv));
	}

	varSet = (gv) => {
		const thisVar = this.queryParams.queryStringValue(gv, true);
		if (thisVar) localStorage[gv] = thisVar;
	};

	varPush = (key) => {
		const params = location.search.split('?');
		const theseVars = [];
		if (params.length > 1) {
			params[1].split('&').forEach((v) => {
				const thisVar = v.split('=');
				if (thisVar && thisVar[0] === key) theseVars.push(thisVar[1]);
			});
		}

		if (theseVars.length) localStorage[key] = JSON.stringify(theseVars);
	};
}
