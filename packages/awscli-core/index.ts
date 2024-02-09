import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';

import * as process from 'process';

export default class AwsCli {
  private readonly path: string;

  private constructor(exePath: string) {
    this.path = exePath;
  }

  public static async getOrInstall(): Promise<AwsCli> {
    try {
      return await AwsCli.get();
    } catch (error) {
      core.debug(`Unable to find "awscli" executable, installing it now. Reason: ${error}`);
      return await AwsCli.install();
    }
  }

  // Will throw an error if `aws` is not installed.
  public static async get(): Promise<AwsCli> {
    if (process.platform === 'win32') {
      // Comes on windows runner provided by GitHub so remove
      await exec.exec('rmdir', ['/Q', '/S', '"C:/Program Files/Amazon"']);
    }
    const exePath = await io.which('aws', true);
    return new AwsCli(exePath);
  }

  private static async install(): Promise<AwsCli> {
    switch (process.platform) {
      case 'darwin':
      case 'linux': {
        const AwsCliPath = await tc.downloadTool('https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip');
        const AwsCliExtractedDir = await tc.extractZip(AwsCliPath);
        core.addPath(AwsCliExtractedDir + '/aws/dist');
        break;
      }

      case 'win32': {
        const AwsCliMsiPath = await tc.downloadTool('https://awscli.amazonaws.com/AWSCLIV2.msi');
        await exec.exec('msiexec.exe', ['/i', AwsCliMsiPath, '/quiet']);
        break;
      }

      default:
        throw new Error(`Unknown platform ${process.platform}, can't install awscli`);
    }

    // Assuming it is in the $PATH already
    return new AwsCli('aws');
  }

  public async version(): Promise<string> {
    const stdout = await this.callStdout(['--version']);
    return stdout.split(' ')[1];
  }

  // awscli which `program`
  public async which(program: string): Promise<string> {
    const stdout = await this.callStdout(['which', program]);

    if (stdout) {
      return stdout;
    } else {
      throw new Error(`Unable to find the ${program}`);
    }
  }

  public async call(args: string[], options?: unknown): Promise<number> {
    return await exec.exec(this.path, args, options);
  }

  // Call the `awscli` and return stdout
  async callStdout(args: string[], options?: unknown): Promise<string> {
    let stdout = '';
    const resOptions = Object.assign({}, options, {
      listeners: {
        stdout: (buffer: Buffer) => {
          stdout += buffer.toString();
        },
      },
    });

    await this.call(args, resOptions);

    return stdout;
  }
}
