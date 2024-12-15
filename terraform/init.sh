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

if [ -e ".terraform.lock.hcl" ]; then
    rm -R ./.terraform
    rm .terraform.lock.hcl
fi

terraform init \
    --backend-config="bucket=$TF_VAR_STATE_BUCKET" \
    --backend-config="key=cloud-route.tfstate" \
    --backend-config="region=$AWS_DEFAULT_REGION"

cd ..