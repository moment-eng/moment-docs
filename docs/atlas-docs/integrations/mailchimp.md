# Atlas Mailchimp API Integration

This guide will help you configure Atlas to authenticate and proxy requests to the Mailchimp API.

Mailchimp is a marketing automation platform.

The [Mailchimp API][mc-api] provides developers with programmatic access to Mailchimp.
This includes APIs for managing lists, audiences, campaigns, and reports.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the Mailchimp API.
-   Authenticate these requests using one or more [Mailchimp API keys][mc-api-keys-docs].

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Mailchimp Owner or Admin permissions.**][mc-roles]

## Provision a Mailchimp API Key

1.  Click your profile picture in the lower left-hand side of the Mailchimp UI.
    Choose the **profile** button in the dropdown menu.

    ![profile-button](/docs/atlas-docs/images/mailchimp-user-menu.png)

1.  Click **Extra > API keys.**

    ![settings-button](/docs/atlas-docs/images/mailchimp-profile.png)

1.  Click the **Create New Key** button.

    ![create-key-button](/docs/atlas-docs/images/mailchimp-api-keys.png)

1.  Provide a name for the Mailchimp API key, and click **Generate Key**.

    ![create-key-button](/docs/atlas-docs/images/mailchimp-generate-key.png)

1.  Click the **Copy To Clipboard** button to copy the API key to your clipboard.
    Then click **Done**.
    You will need this key to configure Atlas in the next step.

    ![copy-key-button](/docs/atlas-docs/images/mailchimp-copy-api-key.png)

## Add Mailchimp Integration to Atlas

Once the Mailchimp API key is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the Mailchimp API key to the Atlas configuration as an environment variable, _e.g._, `MAILCHIMP_API_KEY`.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the Mailchimp API key to the `Authorization` header.

### Step 1: Add Mailchimp API key to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the Mailchimp API key.** Generally this is something like `MAILCHIMP_API_KEY`.
-   **Add the Mailchimp API key you provisioned as an environment variable to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `MAILCHIMP_API_KEY` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `MAILCHIMP_API_KEY` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add Mailchimp API key to Atlas Configuration

We can use the [`mom` CLI][mom] to add the Mailchimp API key to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `MAILCHIMP_API_KEY` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `mailchimp`
-   `DATACENTER` to the Mailchimp datacenter you are using, _e.g._, `us1`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://DATACENTER.api.mailchimp.com \
    -H 'Authorization: Basic ${{ MAILCHIMP_API_KEY }}'
```

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index cb4fc7c..088a9fe 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -20,6 +20,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: HTTP
       name: heroku-2
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -80,3 +84,13 @@ spec:
     value: Bearer ${{ HEROKU_API_KEY }}
   - name: Accept
     value: application/vnd.heroku+json; version=3
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: https://DATACENTER.api.mailchimp.com
+  headers:
+  - name: Authorization
+    value: Basic ${{ MAILCHIMP_API_KEY }}
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `mailchimp` with the name you chose in the previous step if it is different.

```sh
mom curl /v1/apis/http/mailchimp/3.0/
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` with the name you chose for the HTTP adapter in the previous step, _e.g._, `mailchimp`.

```typescript
const httpAdapterName = "mailchimp";
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/3.0/`);
return await response.json();
```

If the integration is working, you should see a JSON object with a general summary of the Mailchimp account.

[mc-api]: https://mailchimp.com/developer/marketing/api/
[mc-roles]: https://mailchimp.com/help/manage-user-levels-in-your-account/
[mc-api-keys-docs]: https://mailchimp.com/help/about-api-keys/
[http-adapter]: /docs/atlas-docs/integrations/http-and-rest-apis.md
[mom]: /docs/atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /docs/atlas-docs/Installations/