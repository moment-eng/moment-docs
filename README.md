# Moment Overview

## What is Moment?

Moment is an environment for infrastructure and platform engineers to quickly build self-serve tools.

Moment is an answer to the thoughts every ops engineer has had, like:
* "Wouldn't it be handy if I could run the correct deployment action directly from my runbook?" (it is very handy!)

or

* "I wish I could keep all my service status visualizations in one place, without having to wrangle a hundred different APIs" (you can!)

or

* "Could I see this information as a dashboard, instead of on the command line?" (easily, with Moment!)

The options are endless, but here are a few of our favorite uses:

* **Interactive, action-oriented runbooks** to replace out-of-date docs and copy pasted CLI commands
* **Cost management tools** for dissecting Kubernetes and non-Kubernetes infrastructure usage and spend by different unit economics specific to your business
* **Release management tooling** with a ChatGPT summary of the release notes and embedded Datadog charts for monitoring
* **Service and Resource Catalogs** to help everyone in your org understand who owns what

Moment has two major parts:
- Moment Canvases, which are documents made of rich text, code, and live data visualizations. Canvases have a full UI toolkit for you to build interactivity into your docs and runbooks.
- Atlas, a secure authenticating proxy, for getting data from your private resources into Moment canvases. It's easy to deploy and makes building developer tools simple (regardless if you're using Moment!).

Get started writing interactive tools with the [Moment Canvas docs](https://docs.moment.dev/moment-docs/docs/atlas-docs).

Or, if you'd like to start with the data side, set up Atlas with the [Atlas docs](https://docs.moment.dev/moment-docs/docs/atlas-docs).
