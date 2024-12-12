#! /bin/sh

set -e
set -x

source env.sh

cd terraform
terraform init

cd ..