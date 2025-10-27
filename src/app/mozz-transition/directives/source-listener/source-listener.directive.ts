import { Directive, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryParametersService } from '../../../common/services/query-parameters.service';

@Directive({ selector: '[sourceListener]' })
export class SourceListenerDirective implements OnInit {
	private route = inject(ActivatedRoute);
	private queryParams = inject(QueryParametersService);

	getVars = ['signup', 'source'];
	getVarSets = ['assertion'];

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

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
