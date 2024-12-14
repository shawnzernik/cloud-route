module "lvt-root" {
  source = "./lvt_network"

  vpc_cidr_block = var.VPC_CIDR
  vpc_name       = var.VPC_NAME

  sn1_name              = var.SN1_NAME
  sn1_cidr_block        = var.SN1_CIDR
  sn1_availability_zone = var.SN1_AZ

  sn2_name              = var.SN2_NAME
  sn2_cidr_block        = var.SN2_CIDR
  sn2_availability_zone = var.SN2_AZ

  region = var.REGION

  instance_network_interface_id = module.cloudroute.instance_primary_network_interface_id
  openvpn_cidr                  = var.OPENVPN_CIDR
}
