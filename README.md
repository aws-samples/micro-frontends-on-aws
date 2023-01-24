# Micro Frontends on AWS

This is a sample project to show how to configure React/Typescript applications for the [`Micro Frontends pattern`](https://microfrontends.com/) and deploy it to AWS with [`Webpack Module Federation`](https://webpack.js.org/concepts/module-federation/).
This project consists of four pieces, a `CDK` app, a `host` app and two remotes apps `remote-1` and `remote-2`.

## Application Preview

![ScreenShot!](/host/public/application_preview.png 'ScreenShot')

## Architecture Overview

![Architecture!](/host/public/mfe_architecture.png 'Architecture')

### AWS Services

-   AWS CDK
-   AWS CodeCommit
-   AWS CodeBuild
-   AWS CodeDeploy
-   AWS S3
-   AWS CloudFront

### Application configuration

Host and remote apps for Micro Frontends are built using ReactJS/Typescript with `Webpack 5 Module Federation`.
All configurations are in the `webpack.config.js` in each application and already all set.
If you want to add or change your remote app name or components, you can update values under the `ModuleFederationPlugin` key.

#### Host App

Webpack config for Host app should be defined to use remote apps.

```js
plugins: [
            new ModuleFederationPlugin({
                name: 'Host',
                remotes: {
                    Remote1: isProduction
                        ? process.env.REMOTE_1
                        : 'Remote1@http://localhost:4000/moduleEntry.js',
                    Remote2: isProduction
                        ? process.env.REMOTE_2
                        : 'Remote2@http://localhost:4001/moduleEntry.js',
                },
```

Dynamic imports remote apps and renders them.

```typescript
const Remote1App = React.lazy(() => import('Remote1/App'));
const Remote1Button = React.lazy(() => import('Remote1/Button'));
const Remote2App = React.lazy(() => import('Remote2/App'));
const Remote2Button = React.lazy(() => import('Remote2/Button'));
```

#### Remote App

Defined a proper name `Remote1` in here to be imported by the Host app, and defined components could be imported.
In this case, Remote-1 app exports `App` and `Button` component.

```js
// webpack.config.js of the Remote #1 app
 plugins: [
        new ModuleFederationPlugin({
            name: 'Remote1',
            filename: 'moduleEntry.js',
            exposes: {
                './App': './src/App',
                './Button': './src/Button',
            },
```

## Running locally

This project uses `Lerna` to manage apps as a mono repo and if you have not installed it before, you need to install it globally.

```bash
$ npm i -g lerna
```

and then, run it in the root directory of this project.

```bash
$ npm run start
```

Lerna will start all applications (`host`, `remote-1`, and `remote-2`) in this project at once.

-   Host: http://localhost:3000
-   Remote-1: http://localhost:4000
-   Remote-2: http://localhost:4001

## Deploying on AWS

To start deploying on AWS, you should upload ReactJS applications to [`AWS CodeCommit`](https://docs.aws.amazon.com/codecommit/latest/userguide/getting-started-cc.html) first.
Although each `repository name` is defined in a cdk file `/cdk/bin/cdk.ts`, you can change it if you want. Please keep in mind you should sync the name with the cdk.

```typescript
const remote_1 = new PipelineStack(app, 'Remote1PipelineStack', {
    appName: 'remote1',
    repositoryName: 'remote-app-1', // this is a repository name of AWS CodeCommit for remote app
});
```

Once, you upload 3 apps to AWS CodeCommit, you can run `cdk deploy` in the cdk directory.

```bash
$ cdk deploy --all --require-approval never
```

Finally, you would see a CloudFront URL for the Host app in your terminal like below when CDK deploys all.

```bash
Outputs:
HostPipelineStack.DistributionDomainName = hostappsample.cloudfront.net
```

## License

This sample project is licensed under the [MIT-0](https://github.com/aws/mit-0) license.
