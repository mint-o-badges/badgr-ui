import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { Issuer } from '../../../issuer/models/issuer.model';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { CollectionBadge } from '../../../issuer/models/collectionbadge.model';
import { CollectionBadgeManager } from '../../../issuer/services/collectionbadge-manager.service';
import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';
import { TOKEN_STORAGE_KEY } from '../../../../../src/app/common/services/session.service';

@Component({
	selector: 'app-collectionbadge-catalog',
	templateUrl: './collectionbadge-catalog.component.html',
	styleUrls: ['./collectionbadge-catalog.component.css'],
})
export class CollectionBadgeCatalogComponent extends BaseRoutableComponent implements OnInit {
	collectionBadgeLoaded: Promise<unknown>;
	collectionBadge: CollectionBadge = null;

	get collectionBadgeSlug() {
		return this.route.snapshot.params['id'];
	}

	data: any = null;

	authToken: string = null;

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		private collectionBadgeManager: CollectionBadgeManager,
		router: Router,
		route: ActivatedRoute,
	) {
		super(router, route);

		// this.collectionBadgeLoaded = this.collectionBadgeManager.collectionbadgeByName(this.collectionBadgeName).then(
		// 	(badge) => {
		// 		this.collectionBadge = badge;
		// 	},
		// 	(error) =>
		// 		this.messageService.reportLoadingError(
		// 			`Cannot find badge ${this.collectionBadgeName}`,
		// 			error
		// 		)
		// );

		this.collectionBadgeLoaded = this.collectionBadgeManager.collectionbadgeById(this.collectionBadgeSlug).then(
			(badge) => {
				this.collectionBadge = badge;
			},
			(error) =>
				this.messageService.reportLoadingError(`Cannot find badge with ID ${this.collectionBadgeSlug}`, error),
		);

		try {
			if (localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY)) {
				this.authToken = localStorage.getItem(TOKEN_STORAGE_KEY);
			}
		} catch (e) {}
	}

	ngOnInit() {
		fetch(`http://localhost:8000/v2/collectionbadges/${this.collectionBadgeSlug}`, {
			headers: {
				Authorization: `Bearer ${this.authToken}`,
				'Content-Type': 'application/json',
			},
		})
			.then((d) => d.json())
			.then((data) => {
				const collectionBadgeData = {
					name: data.result[0].name,
					description: data.result[0].description,
					image: data.result[0].image,
					id: 'collectionBadge',
				};

				const badgeData = data.result[0].assertions.map((d) => {
					return {
						name: d.name,
						description: d.description,
						image: d.image,
						id: d.name,
						parentId: 'collectionBadge',
					};
				});

				const combinedData = [collectionBadgeData, ...badgeData];
				const chart = new OrgChart().compact(false);

				function diagonal(s, d) {
					const path = `M ${s.y} ${s.x}
						C ${(s.y + d.y) / 2} ${s.x},
						  ${(s.y + d.y) / 2} ${d.x},
						  ${d.y} ${d.x}`;

					return path;
				}

				chart
					//@ts-ignore
					.nodeHeight((d) => 200)
					//@ts-ignore
					.nodeWidth((d) => 200)
					.childrenMargin((d) => 280)
					.setActiveNodeCentered(false)
					.container('.chart-container')
					.nodeUpdate(function (d) {
						d3.select(this)
							.select('.node')
							.on('click.node', (e, d) => {
								chart.onButtonClick(e, d);
							});

						d3.select(this).select('.node-button-foreign-object').remove();
					})
					//.buttonContent((d) => '')
					.linkUpdate(function (d) {
						d3.select(this)
							.attr('stroke-width', '5px')
							.style('stroke', 'lightgray')
							.attr('d', function (d) {
								return diagonal(d, d.parent);
							});
					})
					.nodeContent((d) => {
						if (d.depth === 0) {
							// Check if the node is at the top level
							return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
					<polygon points="100,10 
									150,30 
									180,70 
									180,130 
									150,170 
									100,190 
									50,170 
									20,130 
									20,70 
									50,30"  
             style="fill:darkblue;stroke:purple;stroke-width:5;fill-rule:evenodd;" />
				             <rect x="70" y="30" width="60" height="60" rx="30" ry="30" style="fill:white;stroke:none;" />
							 <image href="${combinedData[0].image}" x="80" y="40" width="40" height="40" style="border-radius:50%;" />
    
							 <rect x="30" y="85" width="140" height="40" rx="20" ry="20" style="fill:white;stroke:none;" />
							 <text x="100" y="105" text-anchor="middle" alignment-baseline="middle" style="fill:black; font-size:12px; text-transform: uppercase;">
							 <tspan x="100" dy="0">Kleider-</tspan>
							 <tspan x="100" dy="1.2em">tauschparty</tspan>
							 </text>
							 </svg>
				
				  `;
						} else {
							return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="139" height="160" viewbox="0 0 138.56406460551017 160" style="filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 10px);"><path fill="#ffg" d="M69.28203230275508 0L138.56406460551017 40L138.56406460551017 120L69.28203230275508 160L0 120L0 40Z"></path>
					<image xlink:href="${this.collectionBadge.apiModel.image}" x="34.28203230275508" y="0" width="70" height="120" />
					<text x="69.28203230275508" y="110" text-anchor="middle" style="fill: white; font-size: 12px;">Your Text Here</text>
</svg>
					</svg>
				  
				  `;
						}
					})
					.data(combinedData)
					.render();
			});
	}
}
