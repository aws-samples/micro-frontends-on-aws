import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as path from 'path';

interface CodeRepoStackProps extends cdk.StackProps {
    appName: string;
}

export class CodeRepoStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CodeRepoStackProps) {
        super(scope, id, props);

        const repo = new codecommit.Repository(this, 'Repository', {
            repositoryName: props.appName,
            code: codecommit.Code.fromDirectory(
                path.join(__dirname, `../../${props.appName}/`),
                'main'
            ),
        });
    }
}
