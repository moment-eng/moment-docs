# AWS Atlas integration

This guide describes how to configure Atlas to work with AWS.

Atlas will accept unauthenticated requests destined for the AWS API, authenticate them, and then forward them to the AWS API.
It can authenticate and proxy requests to any of AWS's regions, _e.g._, us-east-1 and us-west-2.
This guide also describes how to send requests to Atlas for authentication and proxying to AWS.

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Configuring Atlas to make requests to AWS

To talk to AWS, Atlas needs your AWS credentials.
This is a pair of `AWS_SECRET_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, plus an optional `AWS_SESSION_TOKEN`.

### Step 1: Provision AWS credentials

We recommend provisioning a new AWS IAM account for Atlas with the smallest set of permissions that will allow you to access the data you need.
AWS credentials are scoped to the region and account you're accessing.
If you want to use Atlas across accounts in multiple AWS regions, you'll need valid credentials for each of those regions.

You can create a new IAM user for Atlas by following AWS's [guide to creating a delegated user](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-delegated-user.html).
Then, create an access key and secret for that user with AWS's [guide to managing access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey).

### Step 2: Add AWS Personal Access Tokens to Atlas Configuration

We can use the [`mom` CLI][mom] to add the AWS secrets to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `PROFILE_NAME` to the name of your aws profile, _e.g._, `pdx`
-   `AWS_SECRET_KEY_ID` with the environment variable name of the access key ID provisioned in the previous step
-   `AWS_SECRET_ACCESS_KEY` with the environment variable name of the secret access key provisioned in the previous step
-   `[,AWS_SESSION_TOKEN]` [optional - remove if unused] with the environment variable name of the session token provisioned in the previous step.

```sh
mom atlas config add-aws-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --profile PROFILE_NAME,AWS_SECRET_KEY_ID,AWS_SECRET_ACCESS_KEY[,AWS_SESSION_TOKEN]
```

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index 3d98f5b..6b7313f 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -12,6 +12,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: HTTP
       name: datadog
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: AWS
+      name: aws
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -50,3 +54,13 @@ spec:
     value: ${{ DDOG_API_KEY }}
   - name: DD-APPLICATION-KEY
     value: ${{ DDOG_APPLICATION_KEY }}
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: AWS
+metadata:
+  name: aws
+spec:
+  profiles:
+  - accessKeyId: ${{ AWS_SECRET_KEY_ID }}
+    name: aws_pdx
+    secretAccessKey: ${{ AWS_SECRET_ACCESS_KEY }}
```

Multiple profiles can be specified if you are targetting more than one AWS environment. The `mom` CLI currently does not support this, but your configuration file can be manually modified if you want to add another AWS profile.

For example, the below changes adds a profile that targets a different AWS region:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index 2bddd05..db6efdc 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -48,3 +48,6 @@ spec:
   - accessKeyId: ${{ PDX_AWS_SECRET_KEY_ID }}
     name: pdx
     secretAccessKey: ${{ PDX_AWS_SECRET_ACCESS_KEY }}
+  - accessKeyId: ${{ IAD_AWS_SECRET_KEY_ID }}
+    name: iad
+    secretAccessKey: ${{ IAD_AWS_SECRET_ACCESS_KEY }}
```

## Do I need an AWS session token?

Almost always, no.
AWS session tokens are an extra security measure.
They grant limited, short-lived permissions for critical resources.
A request sent through Atlas is already limited and short-lived, and Atlas does not expose AWS credentials to the user.
If you're already using Atlas, there's very little advantage to also generating AWS session tokens.
If you do need to generate a session token, follow [AWS's guide to getting temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html).

## Using Atlas with AWS and Moment

Follow the examples in the the [Moment AWS canvas](https://beta.moment.dev/@moment/aws).
