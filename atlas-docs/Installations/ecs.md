# Install Atlas on ECS

This is an install guide to set up a simple ECS cluster with a service running Atlas on AWS.

## Pre-requisites

In order to set up Atlas quickly:

1. [Install Pulumi](https://www.pulumi.com/docs/get-started/install/) (version 3.53.1+).
   Make sure that Pulumi is authorized to access AWS.
1. Create a [Pulumi Organization](https://www.pulumi.com/docs/intro/pulumi-service/organizations/) if you don't already have one.
1. Install Docker Desktop ([Mac](https://docs.docker.com/desktop/install/mac-install/), [Windows](https://docs.docker.com/desktop/install/windows-install/), [Linux](https://docs.docker.com/desktop/install/linux-install/)).
   Make sure Docker Desktop is running.
1. Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
1. Clone this repository.

## Configuration

### Credentials

Atlas needs credentials to access various private data sources. These secrets are not stored by Atlas and can be provided in various ways. Save off a copy of the following under the name `pulumi.config.yml`:
```
config:
  aws:region: "us-west-2"
  tokens:
    "GITHUB_TOKEN": ""
    "PAGERDUTY_ACCOUNT_TOKEN": ""
```
Modify this file to set the tokens.

By default, we install the Atlas cluster in `us-west-2`, but you can update this to your preferred region.

The keys should match the variables configured in the [Atlas configuration](../../../config/atlas/template/atlas.yml).

### Organization Domain

Next, modify the `organization` field in the [Atlas configuration](../../../config/atlas/template/atlas.yml) with your organizational domain (ex: moment.dev). This domain must match the domain registered with Moment.

## Install Dependencies

```sh
cd atlas-install/ecs/pulumi
npm i
```

## Preview

From the `atlas-install/ecs/pulumi` directory, run pulumi preview to ensure the plan looks correct:

```
pulumi preview --config-file=../../config/atlas/template/pulumi.config.yml
```

## Apply

Once it is confirmed that the plan looks as expected, run:

```
pulumi up --config-file=../../config/atlas/template/pulumi.config.yml
```

## Verifying that Atlas is installed from Moment

Once Atlas is installed and you've verified that the ECS service is healthy from the AWS console, check that it's working with Moment by adding a `code cell` with the following code:

```
const res = await atlasProxyFetch("/v1alpha1/instances");

return res.json();
```
