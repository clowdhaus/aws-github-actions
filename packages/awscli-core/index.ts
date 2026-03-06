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
    const exePath = await io.which('aws', true);
    return new AwsCli(exePath);
  }

  private static async install(): Promise<AwsCli> {
    switch (process.platform) {
      case 'linux': {
        const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64';
        const zipPath = await tc.downloadTool(`https://awscli.amazonaws.com/awscli-exe-linux-${arch}.zip`);
        const extractedDir = await tc.extractZip(zipPath);
        await exec.exec(`${extractedDir}/aws/install`, ['--bin-dir', '/usr/local/bin', '--install-dir', '/usr/local/aws-cli']);
        break;
      }

      case 'darwin': {
        const pkgPath = await tc.downloadTool('https://awscli.amazonaws.com/AWSCLIV2.pkg');
        await exec.exec('installer', ['-pkg', pkgPath, '-target', '/']);
        break;
      }

      case 'win32': {
        const msiPath = await tc.downloadTool('https://awscli.amazonaws.com/AWSCLIV2.msi');
        await exec.exec('msiexec.exe', ['/i', msiPath, '/quiet']);
        break;
      }

      default:
        throw new Error(`Unknown platform ${process.platform}, can't install awscli`);
    }

    const exePath = await io.which('aws', true);
    return new AwsCli(exePath);
  }

  public async version(): Promise<string> {
    const stdout = await this.callStdout(['--version']);
    return stdout.split('/')[1].split(' ')[0];
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

  public async call(args: string[], options?: exec.ExecOptions): Promise<number> {
    // Quote the path to handle spaces (e.g. C:\Program Files\...)
    const cmd = this.path.includes(' ') ? `"${this.path}"` : this.path;
    return await exec.exec(cmd, args, options);
  }

  // Call the `awscli` and return stdout
  async callStdout(args: string[], options?: exec.ExecOptions): Promise<string> {
    let stdout = '';
    const resOptions: exec.ExecOptions = {
      ...options,
      listeners: {
        ...options?.listeners,
        stdout: (buffer: Buffer) => {
          stdout += buffer.toString();
          options?.listeners?.stdout?.(buffer);
        },
      },
    };

    await this.call(args, resOptions);

    return stdout;
  }
}
