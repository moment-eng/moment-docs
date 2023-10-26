# `mom` Atlas CLI tooling

Moment’s official CLI `mom` has built-in amenities for interacting with Atlas.
This document covers the basics of using this CLI: installing, configuring, and using it to interact with Atlas.

## Prerequisite: mom CLI Installation

To install `mom`:

1. Download the architecure-specific binary for your operating system using `curl`. For example, `curl https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-darwin-arm64 --output mom` or on Windows `curl https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-windows-amd64 --output mom.exe`. The latest release of `mom` CLI is `v0.3.61`.
    -   [Darwin AMD64](https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-darwin-amd64)
    -   [Darwin ARM64](https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-darwin-arm64)
    -   [Linux AMD64](https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-linux-amd64)
    -   [Linux ARM64](https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-linux-arm64)
    -   [Windows AMD64](https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-windows-amd64)
    -   [Windows ARM64](https://mom-cli-releases.s3.us-west-2.amazonaws.com/v0.3.61/mom-windows-arm64)
1. Move the `mom` binary to a location on your `PATH`. For example, if your `mom` binary is currently in your Downloads directory, on macOS you would do `sudo mv ~/Downloads/mom /usr/local/bin`.
1. Make sure the binary is executable using. On macOS this would be `chmod +x /usr/local/bin/mom`.
1. Check that you get help text by typing `mom`.

To upgrade `mom`:

## Basic Usage

`mom` has 3 main commands:

-   `auth`: Log in and out of the Moment service, generate certificates for local instances of Atlas, _etc_.
-   `atlas`: Generate and modify Atlas configuration files; run instances of Atlas locally.
-   `curl`: Send authenticated HTTP requests to an Atlas instance.

## Logging in

To log in to the Moment service, run `mom auth login`.
This will open a browser window where you can log in to the Moment service.

## Configuring Atlas

### Generating basic config with `mom atlas config generate`

We can use `mom atlas config generate` to generate a simple, initial configuration of Atlas.
Initially this configuration will do nothing, but we will add to it later.

```sh
mom atlas config generate \
    --name my-atlas \       # This can be anything, but should be unique to your organization.
    --preset production \   # Configures Atlas to connect to gateway at `atlas.moment.dev`.
    > atlas.yml
```

### Adding HTTP API integration with `mom atlas config add-http-adapter`

Atlas provides [integrations][integrations] for several popular HTTP APIs.
Integrating Atlas with those APIs generally requires provisioning API credentials, configuring Atlas to use them, and then deploying Atlas, _e.g._, to ECS or Kubernetes.

The guides in that directory explain how to do all of the above for many popular APIs.
The [installation guides][install-guides] explain how to deploy Atlas (_e.g._, to ECS and Kubernetes).

`mom` helps to speed up the process by making it easier to change Atlas configuration.
Supposing we already have a provisioned API credential, we can use `mom atlas config add-http-adapter` to configure Atlas to use it.
Here is an example that configures Atlas to proxy traffic to api.github.com:

```sh
 mom atlas config add-http-adapter \
    -f atlas-staging.yml \
    --adapter-name github \
    --base-url https://api.github.com \
    -H 'Authorization: token ${{ GITHUB_TOKEN }}'
```

We can then test this integration with `mom curl`:

```sh
# Returns the authenticated user's profile as a JSON object.
mom curl /v1/apis/http/github/user
```

## Proxying authenticated requests with `mom curl`

As shown above, `mom curl` can be used to send authenticated HTTP requests to an Atlas instance.
`mom` takes care of authenticating the request, and otherwise works exactly like `curl`—takes the same arguments, flags, and so on.

```sh
# General schema for using Atlas with HTTP APIs
#
#     mom curl /v1/apis/http/{adapterName}/<path as it appears in the API> [curl-args]
#
# For example, if we have an HTTP adapter called `github`, and we want to request the `/user`
# endpoint, we'd write the following:
mom curl /v1/apis/http/github/user
```

By default this command will route requests through atlas.moment.dev, but we can also use the `--base-url` flag to point to any other URL where an Atlas gateway is running.

## Running an instance of Atlas using `mom atlas run`

We can run an instance of Atlas locally using `mom atlas run`:

```sh
mom atlas run -f atlas-staging.yml
```

[integrations]: /atlas-docs/integrations
[install-guides]: /atlas-docs/Installations