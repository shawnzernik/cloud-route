#! /bin/sh

set -e
set -x

# https://datatracker.ietf.org/doc/html/rfc1918
# 10.0.0.0 – 10.255.255.255 (10.0.0.0/8) 
# 172.16.0.0 – 172.31.255.255 (172.19.0.0/12) 
# 192.168.0.0 – 192.168.255.255 (192.168.0.0/16) 

if [ -e ~/.aws-env.sh ]; then
    . ~/.aws-env.sh
else
    export AWS_ACCESS_KEY_ID="AWS_ACCESS_KEY_ID"
    export AWS_SECRET_ACCESS_KEY="AWS_SECRET_ACCESS_KEY"
    export AWS_DEFAULT_REGION="us-west-2"
fi

export STATE_BUCKET="terraform-9d7a5655-8811-4775-8844-7245f2d038ad"

. env.setup.sh
