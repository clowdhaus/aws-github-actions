import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';

vi.mock('@actions/core');
vi.mock('uuid', () => ({v4: () => 'test-uuid'}));
vi.mock('@aws-sdk/client-sts', () => {
  const mockSend = vi.fn().mockResolvedValue({Account: '123456789012'});
  return {
    STSClient: class {
      send = mockSend;
    },
    AssumeRoleCommand: class {
      constructor(public input: unknown) {}
    },
    GetCallerIdentityCommand: class {
      constructor(public input: unknown) {}
    },
  };
});

describe('iam_access_credentials action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'aws-region': 'us-east-1',
        'aws-access-key-id': 'AKIAIOSFODNN7EXAMPLE',
        'aws-secret-access-key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'aws-session-token': '',
        'mask-aws-account-id': 'true',
        'assume-role': 'false',
        'role-arn': '',
        'role-session-name': '',
        'duration-seconds': '900',
        'external-id': '',
      };
      return inputs[name] ?? '';
    });
  });

  it('should export environment variables and mask account id', async () => {
    const {default: run} = await import('./index');
    await run();

    expect(core.exportVariable).toHaveBeenCalledWith('AWS_ACCESS_KEY_ID', 'AKIAIOSFODNN7EXAMPLE');
    expect(core.exportVariable).toHaveBeenCalledWith('AWS_REGION', 'us-east-1');
    expect(core.setOutput).toHaveBeenCalledWith('aws-account-id', '123456789012');
    expect(core.setSecret).toHaveBeenCalledWith('123456789012');
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
