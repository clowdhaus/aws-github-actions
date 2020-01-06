import * as core from '@actions/core';
import stringArgv from 'string-argv';

import AwsCli from '@aws-github-actions/awscli-core';

const run = async (): Promise<void> => {
  try {
    // Inputs:
    const cliCommand = core.getInput('cli-command', { required: true });
    const cliSubcommand = core.getInput('cli-subcommand', { required: true });
    const cliOptions = stringArgv(core.getInput('cli-options', { required: false }).trim());
    const cliParameters = stringArgv(core.getInput('cli-parameters', { required: false }).trim());
    const awsRegion = core.getInput('aws-region', { required: true });

    console.log(cliCommand);
    console.log(cliSubcommand);
    console.log(...cliOptions);
    console.log(...cliParameters);
    console.log(awsRegion);

    const Aws = await AwsCli.getOrInstall();
    // aws [options] <command> <subcommand> [parameters]
    const params = [...cliOptions, cliCommand, cliSubcommand, ...cliParameters, '--region', awsRegion];
    console.log(params);
    const result = await Aws.callStdout(params);
    console.log(result);
    core.setOutput('cli-output', result);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();

export default run;
