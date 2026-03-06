import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';

const mockCallStdout = vi.fn().mockResolvedValue('{"test": "output"}');

vi.mock('@actions/core');
vi.mock('@aws-github-actions/awscli-core', () => ({
  default: {
    getOrInstall: vi.fn().mockResolvedValue({
      callStdout: mockCallStdout,
    }),
  },
}));

describe('awscli action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should execute awscli command and set output', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'cli-command': 'ec2',
        'cli-subcommand': 'describe-instances',
        'cli-options': '',
        'cli-parameters': '--query Reservations',
        'aws-region': 'us-east-1',
      };
      return inputs[name] ?? '';
    });

    const {default: run} = await import('./index');
    await run();

    expect(mockCallStdout).toHaveBeenCalledWith([
      'ec2',
      'describe-instances',
      '--query',
      'Reservations',
      '--region',
      'us-east-1',
    ]);
    expect(core.setOutput).toHaveBeenCalledWith('cli-output', '{"test": "output"}');
  });

  it('should call setFailed on error', async () => {
    vi.mocked(core.getInput).mockImplementation(() => {
      throw new Error('Missing input');
    });

    const {default: run} = await import('./index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Missing input');
  });
});
