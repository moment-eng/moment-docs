# Atlas Infracost Integration

This guide will help you configure Atlas to authenticate and proxy requests to the [Infracost API](https://www.infracost.io/docs/integrations/infracost_api/).


## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.


## Infracost API Key

Follow these directions to get a [Infracost API key](https://www.infracost.io/docs/#2-get-api-key). You must provide an API key in the next step to authorize requests.


## Configuring Atlas

Go to [Atlas Configuration](https://app.moment.dev/settings/atlas) settings and follow the steps to configure and deploy the Infracost adapter using the API key from the previous step.


## Testing your integration

You can make requests with `atlasProxyFetch`.

Add a code cell to your canvas with the following:

```typescript
const query = `
{"query": "{ products(filter: {vendorName: \"aws\", service: \"AmazonEC2\", region: \"us-east-1\", attributeFilters: [{key: \"instanceType\", value: \"m3.large\"}, {key: \"operatingSystem\", value: \"Linux\"}, {key: \"tenancy\", value: \"Shared\"}, {key: \"capacitystatus\", value: \"Used\"}, {key: \"preInstalledSw\", value: \"NA\"}]}) { prices(filter: {purchaseOption: \"on_demand\"}) { USD } } } "}
`;

const resp = await atlasProxyFetch(`/v1/apis/http/infracost/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
});
return resp.json();
```