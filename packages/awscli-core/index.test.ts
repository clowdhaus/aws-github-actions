import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';

vi.mock('@actions/core', () => ({
  debug: vi.fn(),
  addPath: vi.fn(),
}));
vi.mock('@actions/exec', () => ({
  exec: vi.fn().mockResolvedValue(0),
}));
vi.mock('@actions/io', () => ({
  which: vi.fn().mockResolvedValue('/usr/local/bin/aws'),
}));
vi.mock('@actions/tool-cache', () => ({
  downloadTool: vi.fn().mockResolvedValue('/tmp/awscli.zip'),
  extractZip: vi.fn().mockResolvedValue('/tmp/awscli'),
}));

describe('AwsCli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should find existing aws installation', async () => {
    const {default: AwsCli} = await import('./index');
    const cli = await AwsCli.getOrInstall();
    expect(cli).toBeDefined();
  });

  it('should return version string', async () => {
    vi.mocked(exec.exec).mockImplementation(async (_cmd, _args, options) => {
      if (options?.listeners?.stdout) {
        options.listeners.stdout(Buffer.from('aws-cli/2.15.0 Python/3.11.6'));
      }
      return 0;
    });

    const {default: AwsCli} = await import('./index');
    const cli = await AwsCli.getOrInstall();
    const version = await cli.version();
    expect(version).toBe('2.15.0');
  });

  it('should call exec with correct arguments', async () => {
    const {default: AwsCli} = await import('./index');
    const cli = await AwsCli.getOrInstall();
    await cli.call(['s3', 'ls']);

    expect(exec.exec).toHaveBeenCalledWith(
      '/usr/local/bin/aws',
      ['s3', 'ls'],
      undefined,
    );
  });

  it('should install aws cli on linux when not found', async () => {
    vi.mocked(io.which)
      .mockRejectedValueOnce(new Error('not found'))
      .mockResolvedValueOnce('/usr/local/bin/aws');

    const {default: AwsCli} = await import('./index');
    const cli = await AwsCli.getOrInstall();

    expect(tc.downloadTool).toHaveBeenCalledWith('https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip');
    expect(tc.extractZip).toHaveBeenCalled();
    expect(exec.exec).toHaveBeenCalledWith(
      '/tmp/awscli/aws/install',
      ['--bin-dir', '/usr/local/bin', '--install-dir', '/usr/local/aws-cli'],
    );
    expect(cli).toBeDefined();
  });
});
