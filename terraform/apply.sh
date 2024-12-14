#! /bin/sh

set -e
set -x

. env.sh

cd terraform
terraform apply -auto-approve
terraform refresh

cd ../logins
chmod 600 *.pem
cd ..
