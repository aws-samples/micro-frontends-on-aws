import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';

interface PipelineStackProps extends cdk.StackProps {
  appName: string;
  repositoryName: string;
  env?: {
    [name: string]: codebuild.BuildEnvironmentVariable;
  };
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { appName, repositoryName } = props;

    // Create S3 bucket & static hosting setup
    const bucket = new s3.Bucket(this, `${appName}Bucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      versioned: true,
      /**
       * For sample purposes only.
       * This setting will enable full cleanup of the demo.
       */
      autoDeleteObjects: true, // NOT recommended for production code
    });

    // pipeline
    const project = new codebuild.PipelineProject(this, `${appName}Project`, {
      projectName: `${appName}-app-build`,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
        privileged: true,
      },
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      branch: 'main',
      repository: codecommit.Repository.fromRepositoryName(this, appName, repositoryName),
      output: sourceOutput,
    });
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project,
      input: sourceOutput,
      outputs: [buildOutput],
      environmentVariables: props.env ? props.env : {},
    });
    const deployAction = new codepipeline_actions.S3DeployAction({
      actionName: 'deployToS3',
      bucket: bucket,
      input: buildOutput,
    });

    const pipeline = new codepipeline.Pipeline(this, `${appName}Pipeline`, {
      pipelineName: `${appName}-app-pipeline`,
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
        {
          stageName: 'Deploy',
          actions: [deployAction],
        },
      ],
    });

    // Creates a distribution from an S3 bucket.
    const distribution = new cloudfront.Distribution(this, `${appName}-app-dist`, {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
      },
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    // Export cloudfront url
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.domainName,
      description: 'DistributionDomainName',
      exportName: `${appName}-url`,
    });
  }
}
