
const { gitDescribeSync } = require('git-describe');
const { version } = require('./package.json');
const { resolve, relative } = require('path');
const { writeFileSync, existsSync, mkdirSync } = require('fs-extra');

console.log("Starting the file!");

const gitInfo = gitDescribeSync({
    dirtyMark: false,
    dirtySemver: false
});

console.log("2");

gitInfo.version = version;
console.log("3");

if (!existsSync(__dirname + '/src/environments')) {
console.log("4");
    mkdirSync(__dirname + '/src/environments');
}
console.log("5");
const file = resolve(__dirname, 'src', 'environments', 'version.ts');
console.log("6");
writeFileSync(file,
    `// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
/* eslint-disable */
export const VERSION = ${JSON.stringify(gitInfo, null, 4)};
/* tslint:enable */
`, { encoding: 'utf-8' });
console.log("7");

console.log(`Wrote version info ${gitInfo.raw} to ${relative(resolve(__dirname, '..'), file)}`);
