import * as core from '@actions/core';
import AwsCli from '@aws-github-actions/awscli-core';
import stringArgv from 'string-argv';

import {promises as fs} from 'fs';

const run = async (): Promise<void> => {
  try {
    // Inputs:
    const localPath = core.getInput('local-path', {required: true});
    const stat = await fs.lstat(localPath);
    if (!stat.isDirectory()) {
      core.error(`Error: sync API synchronizes a directory not a single file`);
    }
    const bucketName = core.getInput('bucket-name', {required: true});
    const pathPrefix = core.getInput('path-prefix', {required: false});
    const args = stringArgv(core.getInput('args', {required: false}).trim());

    const s3Uri = `s3://${bucketName}/${pathPrefix}`;
    const Aws = await AwsCli.getOrInstall();
    await Aws.call(['s3', 'sync', localPath, s3Uri, ...args]);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();

export default run;
