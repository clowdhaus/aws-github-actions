import * as process from 'process';

import * as io from '@actions/io';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

export class AwsCli {
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
    const exePath = await io.which('aws', true);

    return new AwsCli(exePath);
  }

  private static async install(): Promise<AwsCli> {
    switch (process.platform) {
      case 'darwin':
      case 'linux': {
        const AwsCliWheelPath = await tc.downloadTool(
          'https://files.pythonhosted.org/packages/99/55/6c020e22f81b2b76a1295b07ac92aa4f9aaf44dcb9cead89a6a24a3d828c/awscli-1.16.309-py2.py3-none-any.whl',
        );
        await exec.exec('pip', ['install', '--use-wheel', '--no-index', `--find-links=${AwsCliWheelPath}`, 'awscli']);
        break;
      }

      case 'win32': {
        const AwsCliMsiPath = await tc.downloadTool('https://s3.amazonaws.com/aws-cli/AWSCLI64PY3.msi');
        await exec.exec('msiexec.exe', ['/I', AwsCliMsiPath]);
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

  public async call(args: string[], options?: {}): Promise<number> {
    return await exec.exec(this.path, args, options);
  }

  // Call the `awscli` and return stdout
  async callStdout(args: string[], options?: {}): Promise<string> {
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
