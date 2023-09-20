FROM --platform=linux/amd64 envoyproxy/envoy:v1.23.1

COPY ./envoy.yml /etc/envoy/envoy.yaml

RUN chmod go+r /etc/envoy/envoy.yaml
