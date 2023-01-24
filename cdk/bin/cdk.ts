#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { DependencyGroup } from 'constructs';

const app = new cdk.App();

const remote_1 = new PipelineStack(app, 'Remote1PipelineStack', {
    appName: 'remote1',
    repositoryName: 'remote-app-1',
    env: {
        NODE_ENV: { value: 'production' },
    },
});

const remote_2 = new PipelineStack(app, 'Remote2PipelineStack', {
    appName: 'remote2',
    repositoryName: 'remote-app-2',
    env: {
        NODE_ENV: { value: 'production' },
    },
});

const remotes = new DependencyGroup();
remotes.add(remote_1);
remotes.add(remote_2);

const host = new PipelineStack(app, 'HostPipelineStack', {
    appName: 'host',
    repositoryName: 'host-app',
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

host.node.addDependency(remotes);

app.synth();
