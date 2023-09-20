# Atlas PagerDuty REST API Integration

This guide will help you configure Atlas to authenticate and proxy HTTP requests to PagerDuty's REST API.

PagerDuty is a SaaS-based incident management platform that provides a centralized place to track and resolve incidents.

The [PagerDuty API][pd-api] provides developers with programmatic access to PagerDuty's platform.
This includes APIs for reading and writing incidents, users, and workflows.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the PagerDuty API
-   Authenticate these requests using one or more [PagerDuty API access keys][api-access-keys-docs]

Note that this guide will **NOT configure Atlas to use the PagerDuty Events API.**
The Events API is completely separate from the REST API and requires different API keys.
See the [Atlas PagerDuty Events API Integration][pagerduty-events] guide for more details.

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Admin or Account Owner permissions in PagerDuty.**][roles]

## Provision a General Access PagerDuty API Access Key

PagerDuty supports two types of API access keys:

-   [**General access REST API access keys.**][general-access-keys]
    This is the type of API access key we will provision in this guide.
    They are scoped to an organization and can be used to access all of the PagerDuty REST API.
    They must be provisioned by a PagerDuty administrator or account owner.

-   [**User-scoped REST API access keys.**][user-access-keys]
    These are scoped to a specific user, and can be used to access a subset of the PagerDuty REST API.
    They can be provisioned by any user with a PagerDuty account.

We will provision a general access REST API access key in this guide.
We can do this by following these steps:

1. Go to the PagerDuty [**API Access Keys**][api-access-keys] page.
   Click the **Create New API Key** button.

    ![api-access-keys-create](/atlas-docs/images/pagerduty-api-access-keys-create.png)

1. Provide a name for the PagerDuty API access key.
   Choose whether to make the API access key read-only.
   Click **Create Key**.

    ![api-access-keys-create](/atlas-docs/images/pagerduty-api-access-keys-create-modal.png)

1. Provide a name for the PagerDuty API access key.
   Choose whether to make the API access key read-only.
   Click **Create Key**.

    ![api-access-keys-create](/atlas-docs/images/pagerduty-api-access-keys-created.png)

## Add PagerDuty Integration to Atlas

Once the PagerDuty API access key is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the API access key to the Atlas configuration as an environment variable, _e.g._, `PAGERDUTY_ACCOUNT_TOKEN`.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the API access key to the `Authorization` header.

### Step 1: Add PagerDuty API access key to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the PagerDuty API access key.**
    Generally, this is something like `PAGERDUTY_ACCOUNT_TOKEN`.
-   **Add the PagerDuty API access key you provisioned as an environment variable to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `PAGERDUTY_ACCOUNT_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `PAGERDUTY_ACCOUNT_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add PagerDuty API access key to Atlas Configuration

We can use the [`mom` CLI][mom] to add the PagerDuty API access key to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `PAGERDUTY_ACCOUNT_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `pagerduty`
-   If applicable, replace `https://api.pagerduty.com` with the URL of your [PagerDuty service region][service-region].
    For example, in the EU this is probably `https://api.eu.pagerduty.com/`.

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://api.pagerduty.com \
    -H 'Authorization: Token token=${{ PAGERDUTY_ACCOUNT_TOKEN }}'
```

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index 088a9fe..36b353f 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -24,6 +24,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: HTTP
       name: mailchimp-2
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -43,6 +47,16 @@ spec:
 ---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: https://api.pagerduty.com
+  headers:
+  - name: Authorization
+    value: Token token=${{ PAGERDUTY_ACCOUNT_TOKEN }}
+---
 apiVersion: moment.dev/adapters/v1alpha1
 kind: HTTP
 metadata:
   name: brex-2
 spec:
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `pagerduty` with the name you chose in the previous step if it is different.

```sh
mom curl /v1/apis/http/pagerduty/incidents
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` with the name you chose for the HTTP adapter in the previous step, _e.g._, `pagerduty` or `pagerduty-eu`.

```typescript
const httpAdapterName = "pagerduty"; // or "pagerduty-eu"
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/incidents`);
return await response.json();
```

If the integration is working, you should see a JSON object representing your PagerDuty incidents.

[pd-api]: https://developer.pagerduty.com/api-reference/
[api-access-keys-docs]: https://moment.pagerduty.com/api_keys
[api-access-keys]: https://moment.pagerduty.com/api_keys
[general-access-keys]: https://support.pagerduty.com/docs/api-access-keys#generate-a-general-access-rest-api-key
[user-access-keys]: https://support.pagerduty.com/docs/api-access-keys#generate-a-user-token-rest-api-key
[service-region]: https://support.pagerduty.com/docs/service-regions
[roles]: https://www.pagerduty.com/resources/learn/user-roles-permissions/
[pagerduty-events]: ./pagerduty-events.md
[http-adapter]: /atlas-docs/integrations/http-and-rest-apis.md
[mom]: /atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /atlas-docs/Installations/
