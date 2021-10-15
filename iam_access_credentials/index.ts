import * as core from '@actions/core';
import {STSClient, AssumeRoleCommand, GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import {v4 as uuidv4} from 'uuid';

interface AwsEnvValues {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
  maskAccountId: string;
}

function exportEnvVariables(config: AwsEnvValues): void {
  // Disable workflow commands
  const token = uuidv4();
  console.log(`::stop-commands::${token}`);

  // Export values as environment variables
  // https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html
  core.exportVariable('AWS_ACCESS_KEY_ID', config.accessKeyId);
  core.exportVariable('AWS_SECRET_ACCESS_KEY', config.secretAccessKey);
  if (config.sessionToken) {
    core.exportVariable('AWS_SESSION_TOKEN', config.sessionToken);
  }
  core.exportVariable('AWS_DEFAULT_REGION', config.region);
  core.exportVariable('AWS_REGION', config.region);

  // Re-enable workflow commands
  console.log(`::${token}::`);
}

const run = async (): Promise<void> => {
  try {
    // Inputs:
    const region = core.getInput('aws-region', {required: true});
    const accessKeyId = core.getInput('aws-access-key-id', {required: true});
    const secretAccessKey = core.getInput('aws-secret-access-key', {required: true});
    const sessionToken = core.getInput('aws-session-token', {required: false});
    const maskAccountId = core.getInput('mask-aws-account-id', {required: false});
    const envValues: AwsEnvValues = {
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken,
      maskAccountId,
    };
    exportEnvVariables(envValues);

    // Assume role inputs:
    const assumeRole = core.getInput('assume-role', {required: false});
    const useAssumeRole = assumeRole && assumeRole.toLowerCase() == 'true';
    const roleArn = core.getInput('role-arn', {required: useAssumeRole});
    const roleSessionName = core.getInput('role-session-name', {required: useAssumeRole});
    const durationSeconds = core.getInput('duration-seconds', {required: false});
    const parsedDurationSeconds = Math.max(parseInt(durationSeconds), 900);
    const externalId = core.getInput('external-id', {required: false});

    const sts = new STSClient({
      apiVersion: '2011-06-15',
      customUserAgent: 'aws-github-actions-sts',
    });

    const params = {
      RoleArn: roleArn,
      RoleSessionName: roleSessionName,
      DurationSecond: parsedDurationSeconds,
      ExternalId: externalId,
    };

    // If assuming role, assume then re-export creds to environment
    if (useAssumeRole) {
      const role = await sts.send(new AssumeRoleCommand(params));
      envValues.accessKeyId = role.Credentials.AccessKeyId;
      envValues.secretAccessKey = role.Credentials.SecretAccessKey;
      envValues.sessionToken = role.Credentials.SessionToken;
      exportEnvVariables(envValues);
    }

    // Get AWS account ID
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    const accountId = identity.Account;
    core.setOutput('aws-account-id', accountId);
    if (!envValues.maskAccountId || envValues.maskAccountId.toLowerCase() == 'true') {
      core.setSecret(accountId);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();

export default run;
