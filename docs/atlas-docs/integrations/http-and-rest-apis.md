# Integrating HTTP and REST APIs with Atlas

This guide describes how to configure any HTTP API to work with Atlas.

Atlas can accept unauthenticated requests to any HTTP API, authenticate them, and forward them securely to that API.

You'll need to:
1. Add a new HTTP _profile_ to the Atlas follower config file.
1. Specify the URL of the request.
1. Add any required headers, like authorization headers or API keys.

## Add a new HTTP adapter

You can use the [`mom` CLI](/docs/atlas-docs/install/mom-cli-reference.md) to add new HTTP adapters to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `ADAPTER_TOKEN` to the name of the environment variable you chose in the previous step
-   `ADAPTER_BASE_URL` to the base URL you wish to use, e.g. https://api.github.com
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `github`

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url ADAPTER_BASE_URL \
    -H 'Authorization: token ${{ ADAPTER_TOKEN }}'
```

For example, in the case of a Github adapter, you might have:
```sh
mom atlas config add-http-adapter \
    -f my_atlas.yml \
    --adapter-name github \
    --base-url https://api.github.com \
    -H 'Authorization: token ${{ GITHUB_TOKEN }}'
```
where `my_atlas.yml` is the yaml file you configured in [Getting Started](/docs/atlas-docs/getting-started.md) and `GITHUB_TOKEN` is saved as an environment variable. The last row might look slightly different depending on the type of token.

You should be able to check `my_atlas.yml` (or whatever you name your Atlas YAML) for the configuration.

Any value inside a set of `${{ dollar-and-double-curly-braces }}` will be read as an environment variable from the current environment.

## Apply your Kustomize overlay to your Kubernetes cluster

Follow the instructions in [our installation guide](/docs/atlas-docs/install/kubernetes.md) to apply the Kustomize overlay that you've just modified.

## Testing your adapter

Once your setup is done, you can use `atlasProxyFetch` with the name of your profile.

```typescript
return await(atlasProxyFetch(“/v1/apis/http/my-rest-api/some/endpoint”)).json();
```

This will send the request with the authorization headers you've written.
