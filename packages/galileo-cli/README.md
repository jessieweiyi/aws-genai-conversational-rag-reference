# GALILEO CLI

Useful tool for repeated tasks.

> Note: Currently in experimental mode: executable is registered as `galileo-cli-experimental`.

## Usage

```zsh
# usage
pnpm run galileo-cli-experimental --help

# list available commands
pnpm run galileo-cli-experimental commands
```

## Commands

### Deploy

```shell
> pnpm run galileo-cli-experimental deploy --help

Deploy Galileo into your AWS account

USAGE
  $ galileo-cli-experimental deploy [--name <value>] [--projen] [--profile <value>] [--appRegion <value>] [--llmRegion <value>] [--skipConfirmations] [--cdkCommand <value>] [--cdkRequireApproval
    <value>] [--build] [--saveExec] [--dryRun] [--replay]

FLAGS
  --appRegion=<value>           The region you want to deploy your application
  --build                       Perform build
  --cdkCommand=<value>          [default: deploy] CDK command to run
  --cdkRequireApproval=<value>  [default: never] CDK approval level
  --dryRun                      Only log commands but don't execute them
  --llmRegion=<value>           The region you want to deploy/activate your LLM
  --name=<value>                [default: Galileo] Application name
  --profile=<value>             The profile set up for your AWS CLI (associated with your AWS account)
  --projen                      Run projen to synth project
  --replay                      Replay last successful task(s) execution
  --saveExec                    Save successful task(s) execution to enable replay
  --skipConfirmations           Skip prompt confirmations (always yes)

DESCRIPTION
  Deploy Galileo into your AWS account

EXAMPLES
  $ galileo-cli-experimental deploy --profile=myProfile --appRegion=ap-southeast-1 --llmRegion=us-west-2 --build --saveExec --skipConfirmations

  $ galileo-cli-experimental deploy --dryRun

  $ galileo-cli-experimental deploy --replay --skipConfirmations
```