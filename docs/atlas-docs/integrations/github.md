# Atlas GitHub REST and GraphQL API Integration

This guide will help you configure Atlas to authenticate and proxy HTTP requests to the GitHub REST and GraphQL APIs.

GitHub is a platform that provides a suite of tools for hosting source code and managing various aspects of the software development lifecycle.

The [GitHub REST][gh-rest-api] and [GitHub GraphQL][gh-gql-api] APIs provide developers with programmatic access to the GitHub platform.
This includes dedicated APIs for issue tracking, version control, library and package hosting, project management, automated test execution, deployments, and CI/CD.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the GitHub and GitHub Enterprise APIs
-   Authenticate these requests using one or more [Personal Access Tokens][personal-access-tokens]

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Organization Owner Privileges in GitHub or GitHub Enterprise.**][gh-org-owner]

## Provision a GitHub Personal Access Token

### Step 1: [Optional] Create a dedicated GitHub user for Atlas

It is recommended but not required to create a dedicated GitHub account for generating the [GitHub Personal Access Tokens][personal-access-tokens] Atlas needs to authenticate against the GitHub API.

The alternative is for a specific employee to generate GitHub Personal Access Tokens from their personal account, for Atlas to use.
Having a dedicated GitHub account for this purpose has several advantages over this approach:

-   **Employee-provisioned Personal Access Tokens will stop working if the employee is offboarded.**
    For example, when a GitHub administrator removes the user from a GitHub Organization, any access tokens provisioned to access that GitHub Organization will stop working.
-   **Dedicated GitHub accounts can be managed by a team using tools like 1Password.**
    For example, storing the account password in 1Password allows administrators and ops teams to log in and perform routine operations like rotating secrets.

### Step 2: Provision a GitHub Personal Access Token

1. Click your profile picture in the upper right-hand side of the GitHub UI.
   Choose the **settings** button in the dropdown menu.

    ![settings-button](/docs/atlas-docs/images/github-settings.png)

1. Click the **developer settings** option in the far bottom of the left navbar.

    ![dev-settings](/docs/atlas-docs/images/github-developer-settings.png)

1. Click the **Fine-grained tokens** option in the left navbar.

    ![fine-grained-access-tokens](/docs/atlas-docs/images/github-personal-access-tokens.png)

1. **Name your token** (_e.g._, "Atlas access token") and optionally give it a description.
   Set the **expiration date**, noting that if the token is short-lived, Atlas will be unable to fulfill requests after it expires.

    ![name-access-token](/docs/atlas-docs/images/github-access-token-name.png)

1. Specify the following scopes:

    1. Specify the **resource owner**. This determines which resources this token can access.
       Usually, this is **your company's GitHub Organization** rather than your user.
    1. **Repository access** should be set to **All repositories.**
    1. Set **Read and write access** for **all permissions.**

    ![permissions](/docs/atlas-docs/images/github-permissions.png)

## Add GitHub Integration to Atlas

Once the Personal Access Token is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the GitHub Personal Access Token to the Atlas configuration as an environment variable, _e.g._, `GITHUB_TOKEN`.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the Personal Access Token to the `Authorization` header.

### Step 1: Add GitHub Personal Access Token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the GitHub Personal Access Token.** Generally this is something like `GITHUB_TOKEN`.
-   **Add the GitHub Personal Access Token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `GITHUB_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `GITHUB_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

> NOTE: If your organization has SAML SSO enabled, you will have to have an organization administrator authorize it for use in your organization.
> See [GitHub's documentation][gh-saml-sso] for more details.

### Step 2: Add GitHub Personal Access Token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the GitHub Personal Access Token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `GITHUB_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `github`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://api.github.com \
    -H 'Authorization: token ${{ GITHUB_TOKEN }}'
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
+  baseUrl: https://api.github.com
+  headers:
+  - name: Authorization
+    value: token ${{ GITHUB_TOKEN }}
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `github` with the name you chose in the previous step if it is something else.

```sh
mom curl /v1/apis/http/github/user
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `github` or `github-enterprise`.

```typescript
const httpAdapterName = "github"; // or "github-enterprise"
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/user`);
return await response.json();
```

If the integration is working, you should see a JSON object representing your GitHub user.

[gh-rest-api]: https://docs.github.com/en/rest?apiVersion=2022-11-28
[gh-gql-api]: https://docs.github.com/en/graphql
[personal-access-tokens]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
[gh-org-owner]: https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization#organization-owners
[http-adapter]: /docs/atlas-docs/integrations/http-and-rest-apis.md
[mom]: /docs/atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /docs/atlas-docs/Installations/
[gh-saml-sso]: https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on
