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

if [ ! -e ~/.aws-env.sh ]; then
    echo "ERROR Missing '~/.aws-env.sh'!"
    echo "Creating file"

cat << EOF > ~/.aws-env.sh
#! /bin/sh

set -e
set -x

echo "ERROR You need to edit '~/.aws-env.sh'!"
exit 1

exit_error() {
    echo "ERROR Invalid parameters!"
    echo "Usage: $0 [dev|qa|prod|dr]"
    exit 1
}

if [ -z $1 ]; then
    exit_error
fi

case "$1" in
    dev)
        export AWS_ACCESS_KEY_ID="DEV_AWS_ACCESS_KEY_ID"
        export AWS_SECRET_ACCESS_KEY="DEV_AWS_SECRET_ACCESS_KEY"
        ;;
    qa)
        export AWS_ACCESS_KEY_ID="QA_AWS_ACCESS_KEY_ID"
        export AWS_SECRET_ACCESS_KEY="QA_AWS_SECRET_ACCESS_KEY"
        ;;
    prod)
        export AWS_ACCESS_KEY_ID="PROD_AWS_ACCESS_KEY_ID"
        export AWS_SECRET_ACCESS_KEY="PROD_AWS_SECRET_ACCESS_KEY"
        ;;
    dr)
        export AWS_ACCESS_KEY_ID="DR_AWS_ACCESS_KEY_ID"
        export AWS_SECRET_ACCESS_KEY="DR_AWS_SECRET_ACCESS_KEY"
        ;;
    *)
        exit_error
        ;;
esac
EOF

fi

. ~/.aws-env.sh $1

case "$1" in
    dev)
        export TF_VAR_STATE_BUCKET="terraform-9d7a5655-8811-4775-8844-7245f2d038ad"
        export AWS_DEFAULT_REGION="us-west-2"
        ;;
    qa)
        export TF_VAR_STATE_BUCKET="terraform-1ae708fc-c782-449c-a853-910e23f6d94e"
        export AWS_DEFAULT_REGION="us-west-2"
        ;;
    prod)
        export TF_VAR_STATE_BUCKET="terraform-57f03de4-e469-4cf6-9902-b97b375bbe4e"
        export AWS_DEFAULT_REGION="us-west-2"
        ;;
    dr)
        export TF_VAR_STATE_BUCKET="terraform-b3060830-ff3c-473e-b5d7-5fe1a943a762"
        export AWS_DEFAULT_REGION="us-west-2"
        ;;
    *)
        exit_error
        ;;
esac

export TF_VAR_REGION="$AWS_DEFAULT_REGION"

. env.setup.sh
