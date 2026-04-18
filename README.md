This repository accompanies a guide to using SPIRE with Permify.

## How to run

You need Docker installed on your computer.

- Open a terminal in this repository directory, and run:
  ```sh
  docker compose up
  ```
- Once all containers are running, open a new terminal and run the commands below to test authentication and authorization from end to end:
  ```sh
  curl http://localhost:7773/order  # allowed
  curl http://localhost:7775/audit  # denied
  ```
- To clean up, stop Docker and run:
  ```sh
  docker compose down -v
  docker rmi ghcr.io/spiffe/spire-server:1.14.4
  docker rmi ghcr.io/spiffe/spire-agent:1.14.4
  docker rmi ghcr.io/permify/permify:v1.6.8
  docker rmi denoland/deno:alpine-2.7.11
  docker rmi envoyproxy/envoy:v1.37.2
  ```