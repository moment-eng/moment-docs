# Atlas OpenAI API Integration

This guide will help you configure Atlas to authenticate and proxy requests to the OpenAI API.

OpenAI is an artificial intelligence (AI) research laboratory.
It provides a variety of AI services, products, and APIs, including and especially related to text and image synthesis.

The [OpenAI API][openai-api] provides developers with programmatic access to much of this functionality.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the OpenAI API.
-   Authenticate these requests using one or more [OpenAI API tokens][api-tokens].

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   **A user account with OpenAI, or admin permissions in an [OpenAI Organization][orgs].**

## Provision a OpenAI API token

1.  Click your profile picture in the upper right-hand side of the OpenAI UI.
    Choose the **View API Keys** button in the dropdown menu.

    ![settings-button](/atlas-docs/images/openai-settings.png)

1.  Click the **Create new secret key** button.

    ![api-tokens-tab](/atlas-docs/images/openai-api-keys.png)

1.  Input a description for the API key, and click the **Create secret key** button.

    ![api-tokens-tab](/atlas-docs/images/openapi-create-new-api-key.png)

1.  Copy the API key to your clipboard and save it.

    ![api-tokens-tab](/atlas-docs/images/openai-copy-new-api-key.png)

## [Optional] Get ID of OpenAI Organization you'd like to use, if you have more than one

If you have more than one OpenAI Organization, you will need to specify which one to use.
The OpenAI Organization ID is in the [Organization settings][org-settings] page.

![org-settings](/atlas-docs/images/openai-org-id.png)

## Add OpenAI Integration to Atlas

### Step 1: Add OpenAI API token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the OpenAI API token.** Generally this is something like `OPENAI_API_TOKEN`.
-   **Add the OpenAI API token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `OPENAI_API_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `OPENAI_API_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### [Optional] Step 2: Add OpenAI Organization ID to Atlas Deployment as an Environment Variable

If you have more than one OpenAI Organization, you will need to specify which one to use by adding the OpenAI Organization ID as an environment variable to your Atlas deployment.

-   **Choose an environment variable name for the OpenAI API Organization.** Generally this is something like `OPENAI_ORG_ID`.
-   **Add the OpenAI API token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `OPENAI_ORG_ID` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `OPENAI_ORG_ID` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 3: Add OpenAI API token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the OpenAI API token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `OPENAI_API_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `openai`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://api.openai.com \
    -H 'Authorization: Bearer ${{ OPENAI_API_TOKEN }}'
```

If you used the `OPENAI_ORG_ID` environment variable, you can add it to the command above with the `-H` flag:

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://api.openai.com \
    -H 'Authorization: Bearer ${{ OPENAI_API_TOKEN }}' \
    -H 'OpenAI-Organization: ${{ OPENAI_ORG_ID }}'
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
+  baseUrl: https://api.openai.com
+  headers:
+  - name: Authorization
+    value: Bearer ${{ OPENAI_API_TOKEN }}
```

### Step 4: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 5: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `openai` with the name you chose in the previous step if it is different.

```sh
mom curl /v1/apis/http/openai/v1/models
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `openai`

```typescript
const httpAdapterName = "openai";
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/v1/models`);
return await response.json();
```

If the integration is working, you should see a JSON object with a list of OpenAI users.

The API will likely time out, so try bumping the Envoy timeout (`connect_timeout` in the [envoy config][envoy-config]).

[openai-api]: https://platform.openai.com/atlas-docs/api-reference/introduction
[api-tokens]: https://platform.openai.com/atlas-docs/api-reference/authentication
[orgs]: https://platform.openai.com/atlas-docs/guides/production-best-practices/setting-up-your-organization
[org-settings]: https://platform.openai.com/account/org-settings
[mom]: /atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /atlas-docs/Installations/
[envoy-config]: /config/envoy/envoy.yml
