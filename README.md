# Badgr UI

An Angular 2 based front end for Badgr-server. Uses TypeScript with ES6 style module loading and a webpack-based build process. This is the browser UI for [badgr-server](https://github.com/concentricsky/badgr-server).

### About the Badgr Project

[Badgr](https://badgr.org) was developed by Concentric Sky, starting in 2015 to serve as an open source reference implementation of the Open Badges Specification. It provides functionality to issue portable, verifiable Open Badges as well as to allow users to manage badges they have been awarded by any issuer that uses this open data standard. Since 2015, Badgr has grown to be used by hundreds of educational institutions and other people and organizations worldwide.

## Install Instructions (for developers)

## System-wide prerequisites (OS X):

-   node and npm: see [Installing Node](https://docs.npmjs.com/getting-started/installing-node)
-   (optional) [nvm](https://github.com/creationix/nvm) - node version manager: In order to work with multiple projects on your development environment that have diverse dependencies, you may want to have multiple versions of node installed. NVM allows you to do this. If this applies to you, consider using nvm to manage your node environments. `nvm use` in a project directory with a `.nvmrc` file will use the recommended node version. Make sure to `nvm use [VERSION]` the correct version before any `npm install` steps.

### Install and configure project

-   Install and run [badgr-server](https://github.com/concentricsky/badgr-server-prerelease), the API that this application connects to.
-   Install node/npm version using nvm: `nvm use && nvm install`
-   Install project-specific node dependencies. `npm install`

### Run project in your browser

Start angular in dev mode: `npm start`. Badgr should now be loaded in your browser. If your browser didn't start automatically, navigate to http://localhost:4200

Ensure it is communicating with the correct API (The port `badgr-server` is running on)

```
localStorage.setItem('config', JSON.stringify({api:{baseUrl:"http://localhost:8000"}}))
```

### Run Tests

Run the test suite with `npm run test`

Run the e2e tests with `npm run e2e`

### Configuration

To build for production, a `environment.prod.ts` file must be present in `src/environments/`.
Copy the example file, `environment.prod.ts.example` to `environment.prod.ts` and modify it as needed.
Similarly for staging/develop builds a `environment.staging.ts`/`environment.develop.ts` file needs to be present in `src/environments`, which (for now) is already added in git.

### Building

Build the packaged files for deployment with `npm run build`

Run the tests with `npm run test`

All files in `dist` constitute the build artifact.

#### Bundle a component as a custom element / web component

Components may be bundled as custom elements to be used elsewhere.
In order to include an Angular component for exporting as custom element / web component, follow these steps:

1. Create a bootstrapper for your Angular component
    1. Next to your `my-component.component.ts`, create a `my-component.web-component.ts`
    1. In `my-component.web-component.ts`, call `createWebComponent` from [the utility file](./webcomponents/create-webcomponent.ts) and provide the component, the tag name under which the custom element is registered and the required app configuration (providers etc).
1. Add a build configuration to the `angular.json` file:
    1. In the `web-components-cli` project under `configuration` add `my-component` and specify `main` and `outputPath`, where `main` points to your `my-component.web-component.ts` and outputPath points to `dist/webcomponents/my-component`
1. Add a build step to the `package.json`:
    1. Under scripts add: `"build:web-components:my-component": "ng build web-components-cli --configuration my-component --single-bundle"`

## Deployment

Check out `deployment.md`.

## Branches

Development happens in feature branches (e.g. `feat/foo` or `fix/bar`). Those are then merged (via a PR) into `develop`. The `develop` branch is synchronized automatically with `develop.openbadges.education`. Once dev tests have completed on `develop.openbadges.education`, `develop` is merged (via a PR) into `main`. The `main` branch is synchronized automatically with `staging.openbadges.education`. Once this state is ready for a deployment, `main` is merged (via a PR) into `production`. The `production` branch is synchronized automatically with `openbadges.education`.

## Commit Message Convention

We follow the [angular commit message convention](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md) in this project to maintain a clean and organized commit history. Use `npx cz` instead of `git commit` to commit via the interactive prompt.
