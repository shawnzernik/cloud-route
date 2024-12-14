#! /bin/sh

set -e
set -x

bucket_exists() {
    aws s3api head-bucket --bucket "$STATE_BUCKET"
}

if bucket_exists; then
    echo "Bucket '$STATE_BUCKET' already exists."
else
    echo "Bucket '$STATE_BUCKET' does not exist."
    
    aws s3api create-bucket \
        --bucket "$STATE_BUCKET" \
        --region "$AWS_DEFAULT_REGION" \
        --create-bucket-configuration LocationConstraint="$AWS_DEFAULT_REGION"
        

    aws s3api put-bucket-versioning \
        --bucket "$STATE_BUCKET" \
        --versioning-configuration Status=Enabled
        

    aws s3api put-public-access-block \
        --bucket "$STATE_BUCKET" \
        --public-access-block-configuration \
        'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'        
fi