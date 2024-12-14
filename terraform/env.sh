#! /bin/sh

set -e
set -x

# https://datatracker.ietf.org/doc/html/rfc1918
# 10.0.0.0 – 10.255.255.255 (10.0.0.0/8) 
# 172.16.0.0 – 172.31.255.255 (172.19.0.0/12) 
# 192.168.0.0 – 192.168.255.255 (192.168.0.0/16) 

export AWS_ACCESS_KEY_ID="AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="AWS_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="us-west-2"

export TF_VAR_REGION="$AWS_DEFAULT_REGION"
export TF_VAR_ANYWHERE_CIDR="0.0.0.0/0"

export TF_VAR_STATE_BUCKET="tfs-9d7a5655-8811-4775-8844-7245f2d038ad"
export TF_VAR_STATE_KEY="cloud-route/state.tfstate"

export TF_VAR_VPC_CIDR="10.0.0.0/16"
export TF_VAR_VPC_NAME="cloudroute-vpc"

export TF_VAR_OPENVPN_CIDR="10.0.0.0/24"

export TF_VAR_SN1_NAME="cloudroute-vpc-sn1"
export TF_VAR_SN1_CIDR="10.0.1.0/24"
export TF_VAR_SN1_AZ="us-west-2a"

export TF_VAR_SN2_NAME="cloudroute-vpc-sn2"
export TF_VAR_SN2_CIDR="10.0.2.0/24"
export TF_VAR_SN2_AZ="us-west-2c"

export TF_VAR_VM_NAME="cloudroute"
export TF_VAR_VM_AMI="ami-0d4eea77bb23270f4" # ubuntu 24 arm64
export TF_VAR_VM_INSTANCE_TYPE="t4g.nano" # 2 arm64 0.5gb
export TF_VAR_VM_VOLUME_SIZE="8"
export TF_VAR_VM_VOLUME_TYPE="gp3"
export TF_VAR_VM_SNAPSHOT="false"

# export TF_VAR_VM_IN_SSH_CIDR="$TF_VAR_VPC_CIDR"
# export TF_VAR_VM_IN_WEB_CIDR="$TF_VAR_VPC_CIDR"
export TF_VAR_VM_IN_SSH_CIDR="$TF_VAR_ANYWHERE_CIDR"
export TF_VAR_VM_IN_WEB_CIDR="$TF_VAR_ANYWHERE_CIDR"

source env.setup.sh
