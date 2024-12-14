# Cloud Route

This is an Ubuntu OpenVPN based VPN router intended for use with AWS.  This document will explain:

1. AWS Network Setup
2. Deployment
3. Development

## 1. AWS Network Setup

This will use Terraform to setup a VPC that OpenVPN clients can remote into.  The idea is to setup a private cloud where resources are not public on the internet.  This is a common practice in corporate networks.
