# Atlas Heroku API Integration

This guide will walk you through how to configure Atlas to authenticate and proxy requests to the Heroku Platform API.

Heroku is a cloud platform that specializes in hosting web applications.
It supports a wide variety of languages and frameworks and includes tools for managing and monitoring applications.

The [Heroku Platform API][heroku-api] provides developers with programmatic access to the Heroku platform.
This includes APIs for deployments, teams and users, certificates, and build artifacts.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the Heroku API.
-   Authenticate these requests using one or more [Heroku OAuth Authorization Tokens][oauth-authorizations].

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   [**Admin permissions for your Heroku Team.**][heroku-team-admin]

## Provision a Heroku OAuth Authorization Token

### Step 1: [Optional] Create a dedicated Heroku user for Atlas

It is recommended but not required to create a dedicated Heroku account for generating the [Heroku OAuth Authorization Token][oauth-authorizations] Atlas needs to authenticate against the Heroku API.

The alternative is for a specific employee to generate Heroku OAuth Authorizations Token from their personal account, for Atlas to use.
Having a dedicated Heroku account for this purpose has several advantages over this approach:

-   **Employee-provisioned Heroku Access Tokens will stop working if the employee is offboarded.**
    For example, when a Heroku Team administrator removes the user from a Heroku Team, any access tokens provisioned to access that Heroku Team will stop working.
-   **Dedicated Heroku accounts can be managed by a team using tools like 1Password.**
    For example, storing the account password in 1Password allows administrators and ops teams to log in and perform routine operations like rotating secrets.
-   **This is the approach recommended by Heroku.**
    See the last paragraph of [this help center article](https://help.heroku.com/PBGP6IDE/how-should-i-generate-an-api-key-that-allows-me-to-use-the-heroku-platform-api) for more information.

### Step 2: Generate a Heroku OAuth Authorization Token

1.  Click your profile picture in the upper right-hand side of the Heroku UI.
    Choose the **Settings** button in the dropdown menu.

    ![settings-button](/atlas-docs/images/heroku-settings.png)

1.  Click the **Applications** tab in settings page.

    ![tokens-tab](/atlas-docs/images/heroku-settings-applications.png)

1.  Click the **Create Authorization** button.

    ![create-token](/atlas-docs/images/heroku-create-authorization.png)

1.  Fill out the form to create a new Heroku OAuth Authorization Token and click the **Create** button.
    The **Description** field is not optional.
    (For instance, you might write `Atlas canvas token` or `Atlas - <your-team-name>`.)

    ![create-token-form](/atlas-docs/images/heroku-confirm-create-authorization.png)

1.  Copy the **OAuth Authorization** value.
    You will use this value in the next step, to configure Atlas to authenticate against the Heroku API.

    ![copy-token](/atlas-docs/images/heroku-copy-authorization.png)

## Add Heroku Integration to Atlas

Once the Heroku OAuth Authorization Token is provisioned, we will need to make it available to your running Atlas instance.
We will do this by:

1. Adding the Heroku OAuth Authorization Token to the Atlas configuration as an environment variable, _e.g._, `HEROKU_API_KEY`, which is the variable the Heroku CLI uses.
1. Configuring the Atlas deployment to use an [HTTP adapter][http-adapter] that adds the Heroku OAuth Authorization Token to the `Authorization` header.

### Step 1: Add Heroku OAuth Authorization Token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the Heroku OAuth Authorization Token.**
    Generally, this is something like `HEROKU_API_KEY`, which is the environment variable the Heroku CLI uses.
-   **Add the Heroku OAuth Authorization Token you provisioned as an environment variable to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `HEROKU_API_KEY` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `HEROKU_API_KEY` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add Heroku OAuth Authorization Token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the Heroku OAuth Authorization Token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `HEROKU_API_KEY` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `heroku`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url https://api.heroku.com \
    -H 'Authorization: Bearer ${{ HEROKU_API_KEY }}' \
    -H 'Accept: application/vnd.heroku+json; version=3'
```

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index 33ee175..cb4fc7c 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -16,6 +16,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: HTTP
       name: github-2
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -64,3 +68,15 @@ spec:
   headers:
   - name: Authorization
     value: token ${{ GITHUB_TOKEN }}
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: https://api.heroku.com
+  headers:
+  - name: Authorization
+    value: Bearer ${{ HEROKU_API_KEY }}
+  - name: Accept
+    value: application/vnd.heroku+json; version=3
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `heroku` with the name you chose in the previous step if it is something else.

```sh
mom curl /v1/apis/http/heroku/account
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `heroku`.

```typescript
const httpAdapterName = "heroku";
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/account`, {
    headers: { Accept: "application/vnd.heroku+json; version=3" },
});
return await response.json();
```

If the integration is working, you should see a JSON object representing your Heroku account.

[heroku-api]: https://devcenter.heroku.com/articles/platform-api-reference
[oauth-authorizations]: https://devcenter.heroku.com/articles/oauth
[heroku-team-admin]: https://devcenter.heroku.com/articles/heroku-teams#managing-permissions
[http-adapter]: /atlas-docs/integrations/http-and-rest-apis.md
[mom]: /atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /atlas-docs/Installations/
