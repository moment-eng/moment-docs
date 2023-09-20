# Atlas Brex API Integration

This guide will help you configure Atlas to authenticate and proxy requests to the Brex API.

Brex is a corporate credit card and banking platform for startups.
The [Brex API][brex-api] provides developers with programmatic access to the Brex platform.
This includes APIs for onboarding, teams, payments, and transactions.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the Brex API.
-   Authenticate these requests using one or more [Brex API tokens][api-tokens].

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Account Admin or Card Admin permissions in Brex.**][brex-admin]

## Provision a Brex API token

1.  Click your profile picture in the upper right-hand side of the Brex UI.
    Choose the **settings** button in the dropdown menu.

    ![settings-button](/atlas-docs/images/brex-settings.png)

1.  Click the **Developer** tab.

    ![api-tokens-tab](/atlas-docs/images/brex-developer-settings.png)

1.  Click the **Create Token**.

    ![api-tokens-tab](/atlas-docs/images/brex-create-token.png)

1.  Provide a name for the Brex API token, and select the permissions you want to grant.

    ![api-tokens-tab](/atlas-docs/images/brex-token-permissions.png)

1.  Click the **Allow Access** button.

    ![api-tokens-tab](/atlas-docs/images/brex-confirm-create.png)

1.  Click the **Copy** button to copy the API token to your clipboard.
    You will need this token to configure Atlas in the next step.

    ![api-tokens-tab](/atlas-docs/images/brex-copy-token.png)

## Add Brex Integration to Atlas

### Step 1: Add Brex API token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the Brex API token.** Generally this is something like `BREX_API_TOKEN`.
-   **Add the Brex API token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `BREX_API_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `BREX_API_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add Brex API token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the Brex API token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `BREX_API_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `brex` or `brex-viewer`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://platform.brexapis.com \
    -H 'Authorization: "Bearer ${{ BREX_API_TOKEN }}"'
```

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index 1434ece..204ebde 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -12,6 +12,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: AWS
       name: aws
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -50,3 +54,13 @@ spec:
   headers:
   - name: Authorization
     value: '"token ${{ GITHUB_TOKEN }}"'
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: https://platform.brexapis.com
+  headers:
+  - name: Authorization
+    value: Bearer ${{ BREX_API_TOKEN }}
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `brex` with the name you chose in the previous step if it is different.

```sh
mom curl /v1/apis/http/brex/v2/users
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `brex` or `brex-viewer`.

```typescript
const httpAdapterName = "brex"; // or "brex-viewer"
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/v2/users`);
return await response.json();
```

If the integration is working, you should see a JSON object with a list of Brex users.

[brex-api]: https://developer.brex.com/
[brex-admin]: https://www.brex.com/support/what-are-the-various-brex-role-types
[api-tokens]: https://developer.brex.com/atlas-docs/authentication/
[mom]: /atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /atlas-docs/Installations/
