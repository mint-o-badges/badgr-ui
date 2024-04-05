var shell = require('shelljs');

if (!shell.which('git')) {
	shell.echo('Sorry, this script requires git');
	shell.exit(1);
}

var branchName = shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).replace(/\n/g, '');
var branchVersion = parseVersion(branchName);
if (!branchVersion) {
	shell.echo("Branch name '" + branchName + "' does not follow expected pattern release/v#.#.x");
	shell.exit(1);
}

var versionTags = shell
	.exec('git tag', { silent: true })
	.split('\n')
	.map(parseVersion)
	.filter(function (v) {
		return v && v.major == branchVersion.major && v.minor == branchVersion.minor;
	})
	.sort(function (a, b) {
		// Sort in descending order
		return b.patch - a.patch;
	});
var latestVersion = versionTags[0];
var nextTag;

if (latestVersion) {
	nextTag = 'v' + latestVersion.major + '.' + latestVersion.minor + '.' + (latestVersion.patch + 1);
} else {
	nextTag = 'v' + branchVersion.major + '.' + branchVersion.minor + '.' + 0;
}

shell.echo('Pulling changes for this branch');
shell.exec('git pull');

shell.echo('Tagging the branch');
shell.exec("git tag '" + nextTag + "' -m 'Version " + nextTag + "'");

shell.echo('Pushing the branch');
shell.exec('git push --follow-tags');

function parseVersion(verStr) {
	var parts = verStr.match(/(?:.*\/)?v?(\d+)\.(\d+)\.(\d+|x)/);

	return (
		parts && {
			major: parseInt(parts[1]),
			minor: parseInt(parts[2]),
			patch: parts[3] == 'x' ? null : parseInt(parts[3]),
		}
	);
}
