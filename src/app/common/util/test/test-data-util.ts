////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// General Utilities

let nameUniquenessSeed = 0;

export function randomNames(count: number, randomName: () => string, maxAttemptsPerName = 10) {
	const names = new Set<string>();

	for (let i = 0; i < count * maxAttemptsPerName && names.size < count; i++) {
		names.add(randomName());
	}

	if (names.size !== count) {
		throw new Error(
			`Could not generate ${count} names with ${maxAttemptsPerName} attempts per name using generator: ${randomName}`,
		);
	}

	return Array.from(names.values());
}

export function randomSlugs(count: number, randomName: () => string) {
	return randomNames(count, randomName).map(testSlugForName);
}

export function testSlugForName(name: string) {
	return name
		.replace(/[^\w]+/gi, '-')
		.replace(/^\-+|\-+$/g, '')
		.toLowerCase();
}

export function descriptionFromName(name: string) {
	return `A lengthy and accurate description of ${name} for the purposes of testing things related to ${name}. Also satisfies the requirement of having a fairly long length and looks like normal english.`;
}

function randomNameFromData(nameData: string[][]) {
	// Generate a nice name plus some randomness so we never generate the same name twice (important to avoid slug clashes)
	return (
		nameData.map((part) => part[Math.floor(Math.random() * part.length)]).join(' ') + ` (${++nameUniquenessSeed})`
	);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name Generators

export function randomBadgeName(): string {
	return randomNameFromData([
		['Pruned', 'Skied', 'Climbed', 'Raced', 'Solved'],
		['2', '4', '6', '8'],
		['Trees', 'Slopes', 'Mountains', 'Tracks', 'Problems'],
	]);
}

export function randomUuid(): string {
	let d = new Date().getTime();
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
	return uuid;
}

export function randomIssuerName(): string {
	return randomNameFromData([
		['College', 'Institute', 'School', 'Center'],
		['of', 'for'],
		['Efficient', 'Creative', 'New', 'Subtle', 'Intense'],
		['Learning', 'Building', 'Climbing', 'Teaching', 'Exercising'],
	]);
}

export function randomPersonName() {
	return randomNameFromData([
		[
			'Hilda',
			'Randolph',
			'Andre',
			'Danny',
			'Marcus',
			'Walter',
			'Gail',
			'Ora',
			'William',
			'Heather',
			'Rosalie',
			'Max',
			'John',
			'Joan',
			'Elaine',
			'Rick',
			'Leland',
			'Victor',
			'Ryan',
			'Dolores',
			'Marco',
			'Dwight',
			'Karl',
			'Craig',
		],
		[
			'Alvarez',
			'Meyer',
			'Hernandez',
			'Fuller',
			'Fields',
			'Fleming',
			'Silva',
			'Sandoval',
			'Byrd',
			'Wagner',
			'Mckinney',
			'Sims',
			'Hunt',
			'Fitzgerald',
			'Munoz',
			'Massey',
			'Mills',
			'Strickland',
			'Rodgers',
			'Medina',
			'Beck',
			'Greer',
		],
	]);
}

export function randomEmail() {
	return `${randomPersonName().replace(' ', '.')}@email.test`;
}
