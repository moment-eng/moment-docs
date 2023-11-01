# Atlas Greenhouse Harvest API Integration

This guide will help you configure Atlas to authenticate and proxy HTTP requests to the Greenhouse Harvest API.

Greenhouse is an applicant tracking system (ATS) and hiring system that helps organizations manage the hiring process, from job postings and interview scheduling, to offer letters and onboarding.

The [Greenhouse Harvest API][gh-rest-api] provides developers with programmatic access to the Greenhouse platform.
It can be used to update candidate information, advance, move, and reject candidates, add attachments to candidate profiles, and so on.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the Greenhouse Harvest API
-   Authenticate these requests using one or more [Greenhouse API tokens][api-token]

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Administrator privileges in Greenhouse.**][gh-admin]

## Provision a Greenhouse API token

1. Click the gear-shaped **configure icon** in the upper right-hand side of the Greenhouse UI.
   Choose the **Dev Center** option in the bottom left corner of the page.

    ![settings-button](/atlas-docs/images/greenhouse-settings.png)

1. Click the **API Credential Management** link.

    ![dev-settings](/atlas-docs/images/greenhouse-api-cred-mgmt.png)

1. Click the **Create New API Key** button.

    ![fine-grained-access-tokens](/atlas-docs/images/greenhouse-create-api-key-button.png)

1. Set **API Type** to **Harvest API**, **Partner** to **Custom**, and write a description of what you expect the key to do.

    ![api-type](/atlas-docs/images/greenhouse-create-new-cred.png)

1. **Copy** the API key and click **I have stored the API key**.

    ![name-access-token](/atlas-docs/images/greenhouse-copy-save-key.png)

1. Specify permissions.

    ![permissions](/atlas-docs/images/greenhouse-set-permissions.png)

## Add Greenhouse Harvest API Integration to Atlas

Once the Greenhouse Harvest API token is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the Greenhouse Harvest API token to the Atlas configuration as an environment variable, _e.g._, `GREENHOUSE_HARVEST_TOKEN`.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the Greenhouse Harvest API token to the `Authorization` header.

### Step 1: Encode the Greenhouse Harvest API Token as base 64

In \*nix-style systems, we can do something like the following.
**The trailing `:` is important.**
`Basic` auth requires a username and password, delimited by a `:` character.
The Greenhouse Harvest API token is the username, and the password is empty.

```sh
echo -n <token>: | base64
```

### Step 2: Add Greenhouse Harvest API token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the base64-encoded Greenhouse Harvest API token.**
    Generally this is something like `GREENHOUSE_HARVEST_TOKEN`.
-   **Add the Greenhouse Harvest API Token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `GREENHOUSE_HARVEST_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `GREENHOUSE_HARVEST_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 3: Add Greenhouse Harvest API Token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the Greenhouse Harvest API Token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `GREENHOUSE_HARVEST_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `greenhouse`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://harvest.greenhouse.io \
    -H 'Authorization: Basic ${{ GREENHOUSE_HARVEST_TOKEN }}'
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
+  baseUrl: https://harvest.greenhouse.io
+  headers:
+  - name: Authorization
+    value: Basic ${{ GREENHOUSE_HARVEST_TOKEN }}
```

### Step 4: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 5: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `greenhouse` with the name you chose in the previous step if it is something else.

```sh
mom curl /v1/apis/http/greenhouse/v1/users
```

## Common problems

-   If the Greenhouse Harvest API seems to return an empty string, this is often because the base64 encoding of the API token is incorrect.
    Be sure to include the `echo -n` flag, and a trailing `:` character at the end of the token when base64 encoding it.

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `greenhouse` or `greenhouse-enterprise`.

```typescript
const httpAdapterName = "greenhouse";
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/v1/users`);
return await response.json();
```

If the integration is working, you should see a JSON object representing your GitHub user.

[gh-rest-api]: https://developers.greenhouse.io/harvest.html?shell#introduction
[api-token]: https://developers.greenhouse.io/harvest.html?shell#authentication
[gh-admin]: https://support.greenhouse.io/hc/en-us/sections/360001198631-Admin-guideroles-in-an-organization#organization-owners
[http-adapter]: /atlas-docs/integrations/http-and-rest-apis.md
[mom]: /atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /atlas-docs/Installations/
