# Atlas GitLab REST and GraphQL API Integration

This guide will help you configure Atlas to authenticate and proxy HTTP requests to the GitLab REST and GraphQL APIs.

GitLab is a DevSecOps platform that provides a suite of tools for hosting source code and managing various aspects of the software development lifecycle.

The [GitLab REST][gl-rest-api] and [GitLab GraphQL][gl-gql-api] APIs provide developers with programmatic access to the GitLab platform.
This includes dedicated APIs for issue tracking, version control, library and package hosting, project management, automated test execution, deployments, and CI/CD.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the GitLab APIs
-   Authenticate these requests using one or more [Personal Access Tokens][personal-access-tokens] (or other [GitLab Tokens][gitlab-token-overview]

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.

## Provision a GitLab Personal Access Token

### Step 1: [Optional] Create a dedicated GitLab user for Atlas

It is recommended but not required to create a dedicated GitLab account for generating the [GitLab Personal Access Tokens][personal-access-tokens] Atlas needs to authenticate against the GitLab API.

The alternative is for a specific employee to generate GitLab Personal Access Tokens from their personal account, for Atlas to use.
Having a dedicated GitLab account for this purpose has several advantages over this approach:

-   **Employee-provisioned Personal Access Tokens will stop working if the employee is offboarded.**
    For example, when a GitLab administrator removes the user from a GitLab Organization, any access tokens provisioned to access that GitLab Organization will stop working.
-   **Dedicated GitLab accounts can be managed by a team using tools like 1Password.**
    For example, storing the account password in 1Password allows administrators and ops teams to log in and perform routine operations like rotating secrets.

### Step 2: Provision a GitLab Personal Access Token

Follow the appropriate directions under [GitLab Token Overview][gitlab-token-overview].

## Add GitLab Integration to Atlas

Once the Personal Access Token is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the GitLab Personal Access Token to the Atlas configuration as an environment variable, _e.g._, `GITLAB_TOKEN`.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the Personal Access Token to the `Authorization` header.

### Step 1: Add GitLab Personal Access Token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the GitLab Personal Access Token.** Generally this is something like `GITLAB_TOKEN`.
-   **Add the GitLab Personal Access Token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `GITLAB_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `GITLAB_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add GitLab Personal Access Token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the GitLab Personal Access Token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `GITLAB_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `gitlab`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://gitlab.com/api/v4 \
    -H 'Authorization: token ${{ GITLAB_TOKEN }}'
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
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -50,3 +54,13 @@ spec:
     value: ${{ DDOG_API_KEY }}
   - name: DD-APPLICATION-KEY
     value: ${{ DDOG_APPLICATION_KEY }}
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: https://gitlab.com/api/v4
+  headers:
+  - name: Authorization
+    value: token ${{ GITLAB_TOKEN }}
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `gitlab` with the name you chose in the previous step if it is something else.

```sh
 mom curl /v1/apis/http/gitlab/users/:your_user_id/projects
 ```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `gitlab` 

```typescript
const httpAdapterName = "gitlab";
const yourUserId = "77777777"
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/users/${yourUserId}/projects`);
return await response.json();
```

If the integration is working, you should see a JSON object representing your GitLab user.

[gl-rest-api]: https://docs.gitlab.com/ee/api/rest/
[gl-gql-api]: https://docs.gitlab.com/ee/api/graphql/
[http-adapter]: /atlas-docs/integrations/http-and-rest-apis.md
[mom]: /atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /atlas-docs/Installations/
[personal-access-tokens]: https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html
[gitlab-token-overview]: https://docs.gitlab.com/ee/security/token_overview.html