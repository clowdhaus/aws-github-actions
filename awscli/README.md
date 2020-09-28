<p align="center">
  <img src="../.github/images/aws.png" alt="aws" height="128px">
</p>
<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  awscli
</h1>
<p align="center">
  <img src="https://github.com/clowdhaus/aws-github-actions/workflows/awscli/badge.svg" alt="awscli">
</p>

The `awscli` GitHub action provides access to the official AWS command line interface within an action workflow.

Reference - `aws [options] <command> <subcommand> [parameters]`
Reference - https://docs.aws.amazon.com/cli/latest/reference/index.html#cli-aws

## Usage

```yml
- uses: clowdhaus/aws-github-actions/awscli@master
  with:
    # Command passed to awscli, which is infact the service that is the target of
    # your invocation <i.e. - ec2, s3, ebs, etc.>
    # Required: true
    cli-command: ''

    # Sub-command passed to awscli, which specifies the command on the target service
    # provided in the command <i.e. - for command of ec2, a sub-command could be describe-instances>
    # Required: true
    cli-subcommand: ''

    # CLI Options passed to command invocation
    cli-options: ''

    # Options passed with command and sub-command to further define invocation
    # See `options` under `ec2` (command) `describe-instances (sub-command) here
    # for an example of parameters that can be passed
    # https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-network-interfaces.html
    cli-parameters: ''

    # Intended AWS Region the command invocation is executed against
    # required: true
    aws-region: ''
```

## Scenarios

### Execute describe style command with standard json result output

```yml
- uses: clowdhaus/aws-github-actions/awscli@master
  with:
    cli-command: ec2
    cli-subcommand: describe-dhcp-options
    aws-region: us-east-1
```

### Execute describe style command with query and text output

```yml
- uses: clowdhaus/aws-github-actions/awscli@master
  with:
    cli-command: ec2
    cli-subcommand: describe-network-interfaces
    cli-options: --output text
    cli-parameters: --query NetworkInterfaces[0].SubnetId
    aws-region: us-east-1
```

### Execute describe style command using output from a prior describe command of ID `net-int-subnet-id`

```yml
- uses: clowdhaus/aws-github-actions/awscli@master
  env:
    ACTIONS_RUNNER_DEBUG: true
  with:
    cli-command: ec2
    cli-subcommand: describe-subnets
    cli-parameters: --subnet-id ${{ steps.net-int-subnet-id.outputs.cli-output }} --query Subnets[*].Tags
    aws-region: us-east-1
```
