#! /bin/sh

set -e
set -x

source env.sh

cd terraform
terraform destroy -auto-approve

cd .. 

rm -R openvpn
rm -R logins