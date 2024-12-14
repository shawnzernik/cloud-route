#! /bin/sh

set -e
set -x

. env.sh

cd terraform
terraform init

cd ..