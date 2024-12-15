# Cloud Route

This is an Ubuntu OpenVPN based VPN router intended for use with AWS.  This document will explain:

1. AWS Network
2. Configuration
3. Deployment
4. Development

## 1. AWS Network

This will use Terraform to setup a VPC that OpenVPN clients can remote into.  The idea is to setup a private cloud where resources are not public on the internet.  This is a common practice in corporate networks.

![AWS Network Setup](./documents/aws-network-setup.png)

## 2. Configuration

The following files are used to configure the system:

- terraform/terraform/values.[dev|qa|prod|dr].tfvars  
  Values used to deploy the AWS infrastructure

- ~/.aws-env.sh  
  AWS secrets that cannot get commited to GIT

- terraform/env.sh  
  Update update with S3 and region

- backend/src/Config.ts
  Server side configurations

- database/src/Config.ts
  Database deployment configurations

## 3. Deployment

The deployment is dependent on AWS and Ubuntu Linux.  The following assumptions are made of the OS setup:

1. Login as ubuntu
2. ubuntu can sudo without needing a password
3. can connect to VM with SSH using a PEM certificate

The process will start with using Terraform to standup the environment.  The follwing commands will assume your starting in the same folder as the "cloud-route.code-workspace".

```
cd terraform
./init.sh dev
./plan.sh dev
./apply.sh dev
```

This will create the AWS resources and then execute:

- terraform/terraform/vm.after.sh
- deploy-to-vm.sh
- vm-setup/install.sh

Once this is completed, you VM should be running on a public IP address - this is documented in 'terraform/logins/vpn-server.[dev|qa|prod|dr].md'.
