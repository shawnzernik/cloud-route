#! /bin/sh

set -e
set -x

exit_error() {
    echo "ERROR Invalid parameters!"
    echo "Usage: $0 [dev|qa|prod|dr]"
    exit 1
}

if [ -z $1 ]; then
    exit_error
fi

. env.sh $1

cd terraform
terraform apply \
    -auto-approve \
    -var-file="values.$1.tfvars"

cd ../logins
chmod 600 *.pem
cd ..
