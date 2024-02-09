import * as core from '@actions/core';
import AwsCli from '@aws-github-actions/awscli-core';
import stringArgv from 'string-argv';

const run = async (): Promise<void> => {
  try {
    // Inputs:
    const cliCommand = core.getInput('cli-command', {required: true});
    const cliSubcommand = core.getInput('cli-subcommand', {required: true});
    const cliOptions = stringArgv(core.getInput('cli-options', {required: false}).trim());
    const cliParameters = stringArgv(core.getInput('cli-parameters', {required: false}).trim());
    const awsRegion = core.getInput('aws-region', {required: true});

    const Aws = await AwsCli.getOrInstall();
    // aws [options] <command> <subcommand> [parameters]
    const params = [...cliOptions, cliCommand, cliSubcommand, ...cliParameters, '--region', awsRegion];
    const result = await Aws.callStdout(params);

    core.setOutput('cli-output', result);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();

export default run;
