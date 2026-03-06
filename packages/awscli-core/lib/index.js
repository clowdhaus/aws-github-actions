import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as process from 'process';
export default class AwsCli {
    path;
    constructor(exePath) {
        this.path = exePath;
    }
    static async getOrInstall() {
        try {
            return await AwsCli.get();
        }
        catch (error) {
            core.debug(`Unable to find "awscli" executable, installing it now. Reason: ${error}`);
            return await AwsCli.install();
        }
    }
    static async get() {
        if (process.platform === 'win32') {
            await exec.exec('rmdir', ['/Q', '/S', '"C:/Program Files/Amazon"']);
        }
        const exePath = await io.which('aws', true);
        return new AwsCli(exePath);
    }
    static async install() {
        switch (process.platform) {
            case 'darwin':
            case 'linux': {
                const AwsCliPath = await tc.downloadTool('https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip');
                const AwsCliExtractedDir = await tc.extractZip(AwsCliPath);
                core.addPath(AwsCliExtractedDir);
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
        return new AwsCli('aws');
    }
    async version() {
        const stdout = await this.callStdout(['--version']);
        return stdout.split(' ')[1];
    }
    async which(program) {
        const stdout = await this.callStdout(['which', program]);
        if (stdout) {
            return stdout;
        }
        else {
            throw new Error(`Unable to find the ${program}`);
        }
    }
    async call(args, options) {
        return await exec.exec(this.path, args, options);
    }
    async callStdout(args, options) {
        let stdout = '';
        const resOptions = Object.assign({}, options, {
            listeners: {
                stdout: (buffer) => {
                    stdout += buffer.toString();
                },
            },
        });
        await this.call(args, resOptions);
        return stdout;
    }
}
