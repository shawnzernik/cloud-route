#! /bin/sh

set -e
set -x

. env.sh

cd terraform
terraform destroy -auto-approve

cd .. 

rm -R openvpn
rm -R logins