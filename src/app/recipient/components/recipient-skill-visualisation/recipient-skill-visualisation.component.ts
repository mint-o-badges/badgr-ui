// @ts-nocheck

import { Component, input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ApiRootSkill, ApiSkill } from "../../models/recipient-badge-api.model";

import * as d3 from "d3";
import d3ForceBoundary from "d3-force-boundary";

import futureSkills from "./recipient-skill-visualisation.future.json";

interface ExtendedApiSkill extends Partial<ApiSkill> {
	id: string
	name: string
	description: string
	ancestors: Set<string>
	height: number
	depth: number
	parents: Set<string>
	children: string[]
	leafs: string[]
	leaf: boolean
	group: number
	mouseover: boolean
	clickable: boolean
}

interface SkillLink  {
	source: string
	target: string
}

@Component({
	selector: 'recipient-skill-visualisation',
	templateUrl: './recipient-skill-visualisation.component.html',
	styleUrl: './recipient-skill-visualisation.component.scss',
	standalone: true,
})
export class RecipientSkillVisualisationComponent implements OnChanges {

	@ViewChild('d3canvas') d3canvas: HTMLElement;

	skills = input<ApiRootSkill[]>([]);
	skillTree: Map<string, ExtendedApiSkill>
	d3data: {nodes: ExtendedApiSkill[], links: SkillLink[]} = {
		"nodes": [],
		"links": [],
	};

	constructor() {

	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["skills"] && changes["skills"].currentValue.length) {
			this.prepareData(changes["skills"].currentValue);
			this.initD3();
		}
	}

	prepareData(skills: ApiRootSkill[]) {

		this.skillTree = new Map();
		skills.forEach(s => {
			const breadcrumbs = s.breadcrumb_paths;

			if (futureSkills[s.concept_uri]) {
				breadcrumbs.push([{}, {
					"preferred_label": "future skills",
					"concept_uri": "future-skills"
				}, futureSkills[s.concept_uri], s]);
			}

			breadcrumbs.forEach(breadcrumb => {
				let ancestor = null;
				breadcrumb.forEach((bc, j) => {
					const last = breadcrumb[j-1];
					// skips 'skills'
					if (last) {
						const id = bc.concept_uri;
						// console.log("\t " + id);
						const entry = this.skillTree.get(id) || {
							id: id,
							name: bc.preferred_label,
							description: bc.description,
							depth: j,
							height: breadcrumb.length - j,
							parents: new Set(),
							ancestors: new Set(),
							children: [],
							leafs: [],
							leaf: j == breadcrumb.length - 1,
							group: j == breadcrumb.length - 1 ? 2 : 1,
							mouseover: false,
							clickable: !!bc.description
						}

						if (ancestor && !entry.ancestors.has(ancestor)) {
							// entry.ancestors = [...entry.ancestors, ancestor];
							entry.ancestors.add(ancestor);
						}

						Object.assign(entry, {
							height: Math.max(breadcrumb.length - j, entry.height)
						})

						if (j == 1) {
							ancestor = id;
						}
						if (j > 1 && last?.concept_uri) {
							entry.parents.add(last.concept_uri)
						}

						this.skillTree.set(id, entry);
					}
				});
			})
		});

		const hasFuture = Array.from(this.skillTree.values()).reduce((c, s) => { return s.id == 'future-skills' || c; }, false);
		const topAncestors = new Set(
			Array.from(this.skillTree.values())
				.filter((s) => !s.ancestors.size && s.id != 'future-skills').sort((a, b) => {
					return b.leafs.length - a.leafs.length;
				})
				.map(s => s.id)
				.slice(0, hasFuture ? 4 : 5)
		);

		// console.log(topAncestors);

		this.d3data.nodes = Array.from(this.skillTree.values()).filter((s) =>{
			return topAncestors.has(s.id) || s.id == 'future-skills' || s.ancestors.intersection(topAncestors) >= s.ancestors;
		});

		this.d3data.links = [];
		this.d3data.nodes.forEach(v => {
			if (v.leaf) {
				// console.log([v.id, v])
				for (let a of v.ancestors.values()) {
					this.skillTree.get(a).leafs.push(v.id);
				}
			}
			v.parents.forEach(p => {
				if (this.skillTree.get(p)) {
					this.skillTree.get(p).children.push(v.id);
					this.d3data.links.push({
						'source': v.id,
						'target': p
					})
				}
			})
		});
	}

	initD3() {

		const width = window.innerWidth;
		const height = window.innerHeight;

		const nodeSize = 40;

		const nodeRadius = (d) => ((d.depth == 1 ? (d.leafs.length * 10) : (5 + (d.height * 3) )) + nodeSize) * 1.5;
		// const nodeRadius = (d) => 20;

		// Set the position attributes of links and nodes each time the simulation ticks.
		const onTick = () => {
			link
				// .attr("x", d => { console.log(d.source)})
				.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);

			node
				.attr("transform", d => `translate(${d.x}, ${d.y})`);

			node.sort((d1, d2) => {
				if (d1.mouseover) return 1;
				if (d2.mouseover) return -1;
				return d1.depth - d2.depth;
			})
		};

		// The force simulation mutates links and nodes, so create a copy
		// so that re-evaluating this cell produces the same result.
		const links = this.d3data.links.map(d => ({...d}));
		const nodes = this.d3data.nodes.map(d => ({...d}));

		// Create a simulation with several forces.
		const simulation = d3.forceSimulation(nodes)
			// .force("center", d3.forceCenter(width / 2, height / 2).strength(-0.01))
			.force("center", d3.forceCenter(0, 0).strength(1))
			.force("bounds", d3ForceBoundary(
				width * -0.46,
				height * -0.46,
				width * 0.46,
				height * 0.46
			).strength(0.1).border(10))
			// .force("link", d3.forceLink(links).id(d => d.id).strength(0.1))
			.force("link", d3.forceLink(links).id(d => d.id).distance(10).strength(1))
			// .force("link", d3.forceLink(links).id(d => d.id).distance(l => {
			// 	return l.source.depth == 1 ? 150 : 90;
			// 	// return (nodeRadius(l.source) * 2) + 10
			// 	// return nodeSize * 4;
			// }).strength(1))
			// .force("charge", d3.forceManyBody().strength(nodeSize * -30))
			// .force("charge", d3.forceManyBody().strength(nodeSize * -30))
			// .force("charge", d3.forceManyBody().strength(-500))
			.force("charge", d3.forceManyBody().strength(d => {
				return d.depths == 1 ? -1000 : -500
			}))
			.force("collide", d3.forceCollide((d) => nodeRadius(d)*1.1))
			.force("inner", d3.forceRadial(d => {
				if (d.depth == 1) {
					return 0
				}
				return (d.depth -1) * 150
			}).strength(d => {
				return d.depth == 1 ? 2 : 0.1
			}))
			// .alphaDecay(0.01)
			// .force("x", d3.forceX(d => {
			// 	if (d.depth == 1) {
			// 		return -500
			// 	}
			// 	return 1;
			// }))
			// .force("y", d3.forceY());

		// speed up start
		for (var i = 0; i < 1000; i++) {
			simulation.tick();
		}

		simulation.on("tick", onTick);


		// Create the SVG container.
		const svg = d3.create("svg")
			 .attr("width", width)
			 .attr("height", height)
			 .attr("viewBox", [-width / 2, -height / 2, width, height])
			 .attr("style", "max-width: 100%; height: auto;");

		// Add a line for each link, and a circle for each node.
		const link = svg.append("g")
			.attr("stroke", "#999")
			.attr("stroke-opacity", 1)
			.selectAll("line")
			.data(links)
			.join("line")
			.attr("stroke-width", "2")
			.attr("class", "link");

		const node = svg.append("g")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1.5)
			.selectAll("g")
			.data(nodes)
			.join("g");

		node
			.append("circle")
			// .attr("r", (n) => { return ((n.depth == 1 ? (n.leafs.length * 10) : 10) + nodeSize) * 1.5});
			.attr("r", (d) => nodeRadius(d));
			// .attr("fill", d => color(d.group));

		node.append("title")
			 .text(d => d.name);

		node
			.append("foreignObject")
			.attr("x", (d) => nodeRadius(d) * -1)
			.attr("y", (d) => nodeRadius(d) * -1)
			.attr("height", (d) => nodeRadius(d) * 2)
			.attr("width", (d) => nodeRadius(d) * 2)
			.append("xhtml:div")
			.text(d => { return d.name.replace("/", " / ") })
			.attr('style', (d) => `font-size: ${nodeRadius(d) * 0.20}px;`)
			.attr('text-anchor', "top")
			.attr('class', "name")

		node
			.append("foreignObject")
			.attr("x", (d) => nodeRadius(d) * 0.25)
			.attr("y", (d) => (nodeRadius(d) * -0.5) - ((nodeSize) * 6))
			// .attr("x", (d) => (nodeSize*4) * -2)
			// .attr("y", (d) => (nodeSize) * -3)
			.attr("width", (d) => (nodeSize*4) * 4)
			.attr("height", (d) => (nodeSize) * 6)
			.append("xhtml:div")
			.text(d => { return d.description })
			.attr('style', (d) => `font-size: ${nodeSize * 0.6}px;`)
			.attr('text-anchor', "top")
			.attr('class', "description")

		node
			.attr("class", (d) => `
				${ d.leaf ? 'leaf' : 'group' }
				level-${ d.depth }
				${ d.clickable ? 'clickable' : ''}
			`)

		node.sort((d1, d2) => { return d1.depth - d2.depth; })

		node
			.on("click", (e, d) => {
				// console.log(e, d, n);
				// window.open('http://data.europa.eu' + d.id);
				if (d.description) {
					const others = d3.selectAll('g.leaf, g.group').filter(d2 => d2.id != d.id);
					others.data().forEach(d => { d.mouseover = false; });
					others.nodes().forEach(n => {
						n.classList.remove('show-description');
					});

					const n = d3.selectAll('g.leaf, g.group').filter(d2 => d2.id == d.id).node();
					if (n.classList.contains('show-description')) {
						n.classList.remove('show-description');
						d.mouseover = false;
					} else {
						n.classList.add('show-description');
						d.mouseover = true;
					}

					// needed to reset node order?
					simulation.alphaTarget(0).restart();
				}
			})
			.on("mouseenter", (e, d) => {
				let ancestors = [d.id];
				if (d.depth > 1) {
					ancestors = Array.from(d.ancestors.values());
					// return;
				}
				ancestors.forEach(id => {
					d = this.skillTree.get(id);
					const children = d3.selectAll('g.leaf, g.group').filter(d2 => d2.ancestors.has(d.id));
					const linkedIds = [d.id, ...children.data().map(c => c.id)];
					children.nodes().forEach(n => {
						n.classList.add('show')
					});
					const links = d3.selectAll('line').filter(l => [l.target.id, l.source.id].every(i => linkedIds.includes(i)));
					links.nodes().forEach(n => {
						n.classList.add('show')
					});
				})
			})
			.on("mouseout", (e, d) => {
				let ancestors = [d.id];
				if (d.depth > 1) {
					ancestors = Array.from(d.ancestors.values());
					// return;
				}
				ancestors.forEach(id => {
					d = this.skillTree.get(id);
					const children = d3.selectAll('g.leaf, g.group').filter(d2 => d2.ancestors.has(d.id));
					const linkedIds = [d.id, ...children.data().map(c => c.id)];
					children.nodes().forEach(n => {
						n.classList.remove('show')
					});
					const links = d3.selectAll('line').filter(l => [l.target.id, l.source.id].every(i => linkedIds.includes(i)));
					links.nodes().forEach(n => {
						n.classList.remove('show')
					});
				});
			});

		this.d3canvas.nativeElement.append(svg.node());
	}
}
