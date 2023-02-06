#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { DependencyGroup } from 'constructs';
import { CodeRepoStack } from '../lib/coderepo-stack';

const app = new cdk.App();

const hostRepo = new CodeRepoStack(app, 'HostCodeRepoStack', {
    appName: 'host',
});
const remote1Repo = new CodeRepoStack(app, 'Remote1CodeRepoStack', {
    appName: 'remote-1',
});
const remote2Repo = new CodeRepoStack(app, 'Remote2CodeRepoStack', {
    appName: 'remote-2',
});

const remote_1 = new PipelineStack(app, 'Remote1PipelineStack', {
    appName: 'remote1',
    repositoryName: 'remote-1',
    env: {
        NODE_ENV: { value: 'production' },
    },
});

remote_1.node.addDependency(remote1Repo);

const remote_2 = new PipelineStack(app, 'Remote2PipelineStack', {
    appName: 'remote2',
    repositoryName: 'remote-2',
    env: {
        NODE_ENV: { value: 'production' },
    },
});

remote_2.node.addDependency(remote2Repo);

const remotes = new DependencyGroup();
remotes.add(remote_1);
remotes.add(remote_2);

const host = new PipelineStack(app, 'HostPipelineStack', {
    appName: 'host',
    repositoryName: 'host',
    env: {
        REMOTE_1: {
            value: `Remote1@https://${cdk.Fn.importValue(
                'remote1-url'
            )}/moduleEntry.js`,
        },
        REMOTE_2: {
            value: `Remote2@https://${cdk.Fn.importValue(
                'remote2-url'
            )}/moduleEntry.js`,
        },
        NODE_ENV: { value: 'production' },
    },
});
host.node.addDependency(hostRepo);
host.node.addDependency(remotes);

app.synth();
