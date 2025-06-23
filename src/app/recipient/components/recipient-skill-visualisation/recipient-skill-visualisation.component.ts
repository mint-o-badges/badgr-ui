import { Component, ElementRef, input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ApiRootSkill, ApiSkill } from "../../models/recipient-badge-api.model";

import * as d3 from "d3";
import d3ForceBoundary from "d3-force-boundary";

import futureSkills from "./recipient-skill-visualisation.future.json";
import { debounceTime, fromEvent, Observable, Subject, Subscribable, Subscription, takeUntil, tap } from "rxjs";

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

	@ViewChild('d3canvas') d3canvas: ElementRef<HTMLElement>;

	skills = input<ApiRootSkill[]>([]);
	skillTree: Map<string, ExtendedApiSkill>
	d3data: {nodes: ExtendedApiSkill[], links: SkillLink[]} = {
		"nodes": [],
		"links": [],
	};

	mobile = window.innerWidth < 768;

	resizeSubject$ = new Subject<void>();

	constructor() {

		fromEvent(window, 'resize').pipe(
			debounceTime(300),
			tap((event: UIEvent) => {
				const width = event.target['innerWidth'];
				const wasMobile = this.mobile;
				this.mobile = window.innerWidth < 768;
				if (wasMobile && !this.mobile || !wasMobile && this.mobile) {
					this.initD3();
				}
			}, takeUntil(this.resizeSubject$)) // cleanup
		).subscribe();
	}

	ngOnDestroy() {
		this.resizeSubject$.next();
		this.resizeSubject$.complete();
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

			// add future skills to breadcrumbs if applicable
			if (futureSkills[s.concept_uri]) {
				breadcrumbs.push([{}, {
					"preferred_label": "future skills",
					"concept_uri": "future-skills"
				}, futureSkills[s.concept_uri], s]);
			}

			// loop breadcrumbs to augment skill data
			breadcrumbs.forEach(breadcrumb => {
				let ancestor = null;
				breadcrumb.forEach((bc, j) => {
					const last = breadcrumb[j-1];
					// skips esco top level 'skills'
					if (last) {
						const id = bc.concept_uri;

						// get skill from tree set or create new
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
							studyLoad: 0,
							leaf: j == breadcrumb.length - 1,
							group: j == breadcrumb.length - 1 ? 2 : 1,
							mouseover: false,
							clickable: !!bc.description
						}

						// studyload does not exist on breadcrumb entries, take from top level json
						if (entry.id == s.concept_uri) {
							entry.studyLoad = s.studyLoad;
						}

						if (ancestor && !entry.ancestors.has(ancestor)) {
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

		// sum up leaf studyLoads on top level ancestors
		Array.from(this.skillTree.values()).forEach(v => {
			if (v.leaf) {
				for (let a of v.ancestors.values()) {
					this.skillTree.get(a).studyLoad += v.studyLoad;
				}
			}
		});

		const hasFuture = Array.from(this.skillTree.values()).reduce((c, s) => { return s.id == 'future-skills' || c; }, false);
		// find top level nodes with highest studyLoad, either top 5 or 4 if future skills exist
		const topAncestors = new Set(
			Array.from(this.skillTree.values())
				.filter((s) => !s.ancestors.size && s.id != 'future-skills').sort((a, b) => {
					return b.studyLoad - a.studyLoad;
				})
				.map(s => s.id)
				.slice(0, hasFuture ? 4 : 5)
		);

		// add nodes that either are topAncestors or have a topAncestor or are in future skills
		this.d3data.nodes = Array.from(this.skillTree.values()).filter((s) => {
			return topAncestors.has(s.id) || s.id == 'future-skills' || (s.ancestors.size > 0 && s.ancestors.intersection(topAncestors).size >= s.ancestors.size);
		});

		this.d3data.links = [];
		this.d3data.nodes.forEach(v => {
			if (v.leaf) {
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

		const width = this.mobile ? 540 : 1144;
		const height = width;

		const nodeBaseSize = 50;
		const nodeMaxAdditionalSize = 100;
		const topLevelSkills = this.d3data.nodes.filter(d => d.depth == 1);
		const maxStudyLoad = topLevelSkills.reduce((current, d) => Math.max(current, d.studyLoad), 0)
		const minStudyLoad = topLevelSkills.reduce((current, d) => Math.min(current, d.studyLoad), Number.MAX_SAFE_INTEGER)

		const nodeRadius = (d: ExtendedApiSkill) => {
			if (d.depth == 1) {
				// calculate node sizes based on studyLoad for top level skills
				const size = d.studyLoad / maxStudyLoad;
				return nodeBaseSize + (nodeMaxAdditionalSize * size / 2);
			} else {
				// return default size for everything else
				return nodeBaseSize;
			}
		}

		// Set the position attributes of links and nodes each time the simulation ticks.
		const onTick = () => {
			link
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
		let links = [];
		let nodes = [];
		if (!this.mobile) {
			links = this.d3data.links.map(d => ({...d}));
			nodes = this.d3data.nodes.map(d => ({...d}));
		} else {
			// filter top level nodes for mobile, no links
			nodes = this.d3data.nodes.filter(d => d.depth == 1).map(d => ({...d}));
		}


		// Create a simulation with several forces.
		const simulation = d3.forceSimulation(nodes)
			// center all nodes on the middle
			.force("center", d3.forceCenter(0, 0).strength(1))
			// keep nodes inside SVG bounds
			.force("bounds", d3ForceBoundary(
				width * -0.46,
				height * -0.46,
				width * 0.46,
				height * 0.46
			).strength(0.1).border(10))
			// force between links
			.force("link", d3.forceLink(links).id((d) => (d as ExtendedApiSkill).id).distance(10).strength(1))
			// force between nodes ("charged" magentism)
			.force("charge", d3.forceManyBody().strength(d => {
				return (d as ExtendedApiSkill).depth == 1 ? -1000 : -500
			}))
			// prevent overlapping nodes
			.force("collide", d3.forceCollide((d) => nodeRadius(d)*1.1))
			// forces nodes into "rings", basically creating a ring of nodes for each depth level
			// which helps keeping distances uniform
			.force("inner", d3.forceRadial(d => {
				if ((d as ExtendedApiSkill).depth == 1) {
					return 0
				}
				return ((d as ExtendedApiSkill).depth -1) * (nodeBaseSize * 3)
			}).strength(d => {

				return (d as ExtendedApiSkill).depth == 1 ? 2 : 0.1
			}))

		// skip ticks do skip "start animation"
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
			.attr("r", (d) => nodeRadius(d));

		node.append("title")
			 .text(d => d.name);

		// add foreignObject for text styling / positioning
		node
			.append("foreignObject")
			.attr("x", (d) => nodeRadius(d) * -1)
			.attr("y", (d) => nodeRadius(d) * -1)
			.attr("height", (d) => nodeRadius(d) * 2)
			.attr("width", (d) => nodeRadius(d) * 2)
			.attr('class', "fo-name")
			.append("xhtml:div")
			// DEBUG: output studyload if not 0
			// .text(d => { return d.name.replace("/", " / ") + (d.studyLoad !== 0 ? ` (${d.studyLoad} min)` : '') })
			.text(d => { return d.name.replace("/", " / ") })
			.attr('style', (d) => `font-size: ${nodeRadius(d) * 0.20}px;`)
			.attr('text-anchor', "top")
			.attr('class', "name")

		// add foreignObject for description text popover
		node
			.append("foreignObject")
			.attr("x", (d) => nodeRadius(d) * 0.25)
			.attr("y", (d) => (nodeRadius(d) * -0.5) - ((nodeBaseSize) * 2)) // half radius - height of popover
			.attr("width", (d) => (nodeBaseSize) * 6)
			.attr("height", (d) => (nodeBaseSize) * 2)
			.attr('class', "fo-description")
			.append("xhtml:div")
			.text(d => { return d.description })
			.attr('style', (d) => `font-size: 12px;`)
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

				// TODO: dynamically resize description popover, reposition if out of screen?

				if (d.description) {
					const others = d3.selectAll<SVGElement, ExtendedApiSkill>('g.leaf, g.group').filter(d2 => d2.id != d.id);
					others.data().forEach(d2 => { d2.mouseover = false; });
					others.nodes().forEach(n => {
						n.classList.remove('show-description');
					});

					const n = d3.selectAll<SVGElement, ExtendedApiSkill>('g.leaf, g.group').filter(d2 => d2.id == d.id).node();
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
				// find all node parents and links to toggle show
				let ancestors = [d.id];
				if (d.depth > 1) {
					ancestors = Array.from(d.ancestors.values());
				}
				// in case of multiple ancestors show all breadcrumb paths
				ancestors.forEach(id => {
					d = this.skillTree.get(id);
					const children = d3.selectAll<SVGElement, ExtendedApiSkill>('g.leaf, g.group').filter(d2 => d2.ancestors.has(d.id));
					const linkedIds = [d.id, ...children.data().map(c => c.id)];
					children.nodes().forEach(n => {
						n.classList.add('show')
					});
					const links = d3.selectAll<SVGElement, d3.HierarchyLink<ExtendedApiSkill>>('line').filter(l => [l.target.id, l.source.id].every(i => linkedIds.includes(i)));
					links.nodes().forEach(n => {
						n.classList.add('show')
					});
				})
			})
			.on("mouseout", (e, d) => {
				let ancestors = [d.id];
				if (d.depth > 1) {
					ancestors = Array.from(d.ancestors.values());
				}
				ancestors.forEach(id => {
					d = this.skillTree.get(id);
					const children = d3.selectAll<SVGElement, ExtendedApiSkill>('g.leaf, g.group').filter(d2 => d2.ancestors.has(d.id));
					const linkedIds = [d.id, ...children.data().map(c => c.id)];
					children.nodes().forEach(n => {
						n.classList.remove('show')
					});
					const links = d3.selectAll<SVGElement, d3.HierarchyLink<ExtendedApiSkill>>('line').filter((l) => [l.target.id, l.source.id].every(i => linkedIds.includes(i)));
					links.nodes().forEach(n => {
						n.classList.remove('show')
					});
				});
			});

		// clear previous versions (on mobile change)
		this.d3canvas.nativeElement.innerHTML = '';
		this.d3canvas.nativeElement.append(svg.node());
	}
}
