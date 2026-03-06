import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as exec from '@actions/exec';

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
    expect(version).toBe('Python/3.11.6');
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
});
