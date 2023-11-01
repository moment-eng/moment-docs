# Atlas Vercel API Integration

This guide will walk you through how to configure Atlas to authenticate and proxy requests to the Vercel API.

Vercel is a cloud platform that specializes in static site hosting and serverless functions.

The [Vercel API][vercel-api] provides developers with programmatic access to the Vercel platform.
This includes APIs for deployments, teams and users, certificates, and build artifacts.

## Results at the end of this guide

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the Vercel API.
-   Authenticate these requests using one or more [Vercel Access Tokens][access-tokens-docs].

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Team Owner in Vercel.**][vercel-team-owner]

## Provision a Vercel Access token

### Step 1: [Optional] Create a dedicated Vercel user for Atlas

It is recommended but not required to create a dedicated Vercel account for generating the [Vercel Access Tokens][access-tokens-docs] Atlas needs to authenticate against the Vercel API.

The alternative is for a specific employee to generate Vercel Access Tokens from their personal account, for Atlas to use.
Having a dedicated Vercel account for this purpose has several advantages over this approach:

-   **Employee-provisioned Vercel Access Tokens will stop working if the employee is offboarded.**
    For example, when a Vercel administrator removes the user from a Vercel Team, any access tokens provisioned to access that Vercel Team will stop working.
-   **Dedicated Vercel accounts can be managed by a team using tools like 1Password.**
    For example, storing the account password in 1Password allows administrators and ops teams to log in and perform routine operations like rotating secrets.

### Step 2: Generate a Vercel Access Token

1.  Click your profile picture in the upper right-hand side of the Vercel UI.
    Choose the **Settings** button in the dropdown menu.

    ![settings-button](/atlas-docs/images/vercel-settings.png)

1.  Click the **Tokens** tab in the left-hand side of the page.

    ![tokens-tab](/atlas-docs/images/vercel-settings-sidebar.png)

1.  Fill out the form to generate a new token.

    -   Provide a descriptive **name** for the token.
    -   Set **role** to be the Vercel Team you want to access.
    -   Set an expiration date for the token. Note that when the token expires, everything using it will break.
    -   Click the **create** button.

    ![generate-token](/atlas-docs/images/vercel-create-token.png)

1.  Click the **copy** button to copy the token to your clipboard.
    Store this token in a secure location, as you will need it in the next step.

    ![copy-token](/atlas-docs/images/vercel-token-copy.png)

## Add Vercel Integration to Atlas

Once the Vercel Access Token is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the Vercel Access Token to the Atlas configuration as an environment variable, _e.g._, `VERCEL_ACCESS_TOKEN`.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the Vercel Access Token to the `Authorization` header.

### Step 1: Add Vercel Access Token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the Vercel Access Token.** Generally this is something like `VERCEL_ACCESS_TOKEN`.
-   **Add the Vercel Access Token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `VERCEL_ACCESS_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `VERCEL_ACCESS_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add Vercel Access Token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the Vercel Access Token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `VERCEL_ACCESS_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `vercel`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://api.vercel.com \
    -H 'Authorization: Bearer ${{ VERCEL_ACCESS_TOKEN }}'
```

The diff in your version control system should look something like this:

```diff
diff --git a/atlas-staging.yml b/atlas-staging.yml
index 3b26dde..d4a4f86 100644
--- a/atlas-staging.yml
+++ b/atlas-staging.yml
@@ -32,6 +32,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: HTTP
       name: stripe-2
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -122,3 +126,13 @@ spec:
   headers:
   - name: Authorization
     value: Bearer ${{ STRIPE_API_KEY }}
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: https://api.vercel.com
+  headers:
+  - name: Authorization
+    value: Bearer ${{ VERCEL_ACCESS_TOKEN }}
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `vercel` with the name you chose in the previous step if it is different.

```sh
mom curl /v1/apis/http/vercel/v2/user
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `vercel`.

```typescript
const httpAdapterName = "vercel";
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/v2/user`);
return await response.json();
```

If the integration is working, you should see a JSON object representing your Vercel user account.

[vercel-api]: https://vercel.com/docs/rest-api
[vercel-team-owner]: https://vercel.com/docs/teams-and-accounts/team-members-and-roles#owner-role
[access-tokens-docs]: https://vercel.com/docs/rest-api#introduction/api-basics/authentication
[http-adapter]: /atlas-docs/integrations/http-and-rest-apis.md
[mom]: /atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /atlas-docs/Installations/
