# Atlas Stripe API Integration

This guide will help you configure Atlas to authenticate and proxy requests to the Stripe API.

Stripe is a payment processing platform for online and mobile businesses.
It offers payments, fraud detection, checkout links, billing, invoicing, and more.

The [Stripe API][stripe-api] provides developers with programmatic access to the Stripe platform.
This includes charges, disputes, events, payouts, refunds, customer analytics, and team management.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the Stripe API.
-   Authenticate these requests using one or more [Stripe API keys][api-keys].

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Stripe Account Owner, Administrator, or IAM Admin permissions.**][stripe-admin]

## Provision a Stripe API key

Stripe offers several types of API keys.
We recommend provisioning [restricted API keys][restricted-api-keys] for use with Atlas.
The steps to do this are as follows:

1.  From the [Stripe dashboard][stripe-dashboard] click the **Developers** button in the top-right corner.

    ![settings-button](/docs/atlas-docs/images/stripe-developers.png)

1.  Choose the **API keys** tab.

    ![api-keys-tab](/docs/atlas-docs/images/stripe-api-keys.png)

1.  Click the **Create restricted key** button.

    ![create-restricted-api-key](/docs/atlas-docs/images/stripe-restricted-keys.png)

1.  Name the key, and select the permissions you want to grant.

    ![api-keys-tab](/docs/atlas-docs/images/stripe-name-and-permissions.png)

1.  When you're done, click the **Create key** button in the bottom left corner.

    ![create-key-button](/docs/atlas-docs/images/stripe-create-key.png)

1.  Copy the key and save it somewhere safe.
    You will need it in the next step to configure Atlas to proxy requests to the Stripe API.

    ![copy-key](/docs/atlas-docs/images/stripe-copy-key.png)

## Add Stripe Integration to Atlas

Once the Stripe API key is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the Stripe API key to the Atlas configuration as an environment variable, _e.g._, `STRIPE_API_KEY`.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the Stripe API key to the `Authorization` header.

### Step 1: Add Stripe API key to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the Stripe API key.** Generally this is something like `STRIPE_API_KEY`.
-   **Add the Stripe API key you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `STRIPE_API_KEY` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `STRIPE_API_KEY` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add Stripe API key to Atlas Configuration

We can use the [`mom` CLI][mom] to add the Stripe API key to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `STRIPE_API_KEY` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `stripe`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://api.stripe.com \
    -H 'Authorization: Bearer ${{ STRIPE_API_KEY }}'
```

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index 36b353f..3b26dde 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -28,6 +28,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: HTTP
       name: pagerduty-2
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -108,3 +112,13 @@ spec:
   headers:
   - name: Authorization
     value: Basic ${{ MAILCHIMP_API_KEY }}
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: https://api.stripe.com
+  headers:
+  - name: Authorization
+    value: Bearer ${{ STRIPE_API_KEY }}
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `stripe` with the name you chose in the previous step if it is different.

```sh
mom curl /v1/apis/http/stripe/v1/charges
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `stripe` or `stripe-viewer`.

```typescript
const httpAdapterName = "stripe";
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/v1/charges`);
return await response.json();
```

If the integration is working, you should see a JSON object with a list of Stripe charges.

[stripe-api]: https://stripe.com/docs/api
[stripe-admin]: https://stripe.com/docs/account/teams/roles
[api-keys]: https://stripe.com/docs/keys
[restricted-api-keys]: https://stripe.com/docs/keys#limit-access
[stripe-dashboard]: https://dashboard.stripe.com/dashboard
[http-adapter]: /docs/atlas-docs/integrations/http-and-rest-apis.md
[mom]: /docs/atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /docs/atlas-docs/Installations/
