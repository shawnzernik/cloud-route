#! /bin/sh

# podman run -d --name podman-registry -p 5001:5000 --restart=always registry:2

podman stop tre-container
podman rm tre-container

podman build --network=host -t localhost:5001/shawnzernik/tre:latest .
podman build --network=host -t localhost:5001/shawnzernik/tre:0.0.1 .

podman run -d --network=lvt \
    --name tre-container \
    -e DB_HOST=postgres \
    -p 4433:4433 \
    localhost:5001/shawnzernik/tre:latest