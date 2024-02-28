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
import * as d3 from 'd3'
import {OrgChart} from 'd3-org-chart'

@Component({
	selector: 'app-collectionbadge-catalog',
	templateUrl: './collectionbadge-catalog.component.html',
	styleUrls: ['./collectionbadge-catalog.component.css'],
})
export class CollectionBadgeCatalogComponent extends BaseRoutableComponent implements OnInit {

	collectionBadgeLoaded: Promise<unknown>;
	collectionBadge: CollectionBadge = null;

    get collectionBadgeName() {
		return this.route.snapshot.params['id'];
	}

	data: any = null


	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		private collectionBadgeManager: CollectionBadgeManager,
		router: Router,
		route: ActivatedRoute,
	) {
		super(router, route);

        this.collectionBadgeLoaded = this.collectionBadgeManager.collectionbadgeByName(this.collectionBadgeName).then(
			(badge) => {
				this.collectionBadge = badge;
			},
			(error) =>
				this.messageService.reportLoadingError(
					`Cannot find badge ${this.collectionBadgeName}`,
					error
				)
		);

	}    

	ngOnInit() {
		// super.ngOnInit();
			//   const radiusScale = d3.scaleSqrt().domain([min, max]).range([10, 100]);
			//   data.forEach((d) => {
			// 	d._radius = Math.round(radiusScale(d.value) * 10) / 10;
			//   });
			fetch('http://localhost:8000/public/all-collectionbadges')
			  .then((d) => d.json())
			  .then((data) => {
				const [min, max] = [264, 956129]

			//   })


			// fetch(
			// 	'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/flatData.json'
			//   )
			// 	.then((d) => d.json())
			// 	.then((data) => {
			// 	  const [min, max] = d3.extent(data, (d) => d.value);
			// 	  const radiusScale = d3.scaleSqrt().domain([min, max]).range([10, 100]);
			// 	  data.forEach((d) => {
			// 		d._radius = Math.round(radiusScale(d.value) * 10) / 10;
			// 	  });
			const collectionBadgeData = 
			       { 
					name: this.collectionBadge.apiModel.name,
					description: this.collectionBadge.apiModel.description,
					image: this.collectionBadge.apiModel.image,
					id: 'collectionBadge'
				   }
 
			const badgeData = data.map(d => {return {
				name: d.name,
				description: d.description,
				image: d.image,
				id: d.name,
				parentId: 'collectionBadge'

			}})

			const combinedData = [collectionBadgeData, badgeData[0]]
			const chart = new OrgChart().compact(false)
								
		      
			  //@ts-ignore
			  chart.layoutBindings().top.linkY = (n) => n.y - 24;
			  
			//   chart.zoomBehavior(d3.zoom().on("zoom", null));
		
			  chart
			    //@ts-ignore
				.nodeHeight((d) => 200)
			    //@ts-ignore
				.nodeWidth((d) => 200)
				.childrenMargin((d) => 180)
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
					.style('stroke', 'lightgray');
				})
				.nodeContent(
				  (d) =>{
				  if (d.depth === 0) { // Check if the node is at the top level
					return `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
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
							 <text x="100" y="105" text-anchor="middle" alignment-baseline="middle" style="fill:black; font-size:12px; text-transform: uppercase;">${combinedData[0].name}</text>
				  </svg>
				  `;
				} else{
					return `<div style='width:100%;height:100%;'>
					<svg  width="120" height="120">
					<polygon points="60,4 116,34 116,70 60,100 4,70 4,34" 
							 style="fill:lightgray;stroke:gray;stroke-width:2;" />
							 <rect x="30" y="30" width="60" height="60" rx="30" ry="30" style="fill:white;stroke:none;" />
        <image href="https://bumbeishvili.github.io/avatars/avatars/portrait18.png" x="40" y="40" width="40" height="40" style="border-radius:50%;" />
				  </svg>
					</div>`
			}})
				.data(combinedData)
				.render();
			})	
	}
}
