resource "aws_vpc" "lvt_network" {
  cidr_block           = var.vpc_cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = var.vpc_name
  }
}

resource "aws_internet_gateway" "lvt_network_igw" {
  vpc_id = aws_vpc.lvt_network.id

  tags = {
    Name = "${var.vpc_name}-igw"
  }
}

resource "aws_subnet" "lvt_network_sn1" {
  vpc_id                  = aws_vpc.lvt_network.id
  cidr_block              = var.sn1_cidr_block
  availability_zone       = var.sn1_availability_zone
  map_public_ip_on_launch = false

  tags = {
    Name = var.sn1_name
  }
}

resource "aws_subnet" "lvt_network_sn2" {
  vpc_id                  = aws_vpc.lvt_network.id
  cidr_block              = var.sn2_cidr_block
  availability_zone       = var.sn2_availability_zone
  map_public_ip_on_launch = false

  tags = {
    Name = var.sn2_name
  }
}

resource "aws_route_table" "lvt_network_sn1_rt" {
  vpc_id = aws_vpc.lvt_network.id

  tags = {
    Name = "${var.sn1_name}-rt"
  }
}

resource "aws_route" "lvt_network_sn1_rt_internet" {
  route_table_id         = aws_route_table.lvt_network_sn1_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.lvt_network_igw.id
}

resource "aws_route" "lvt_network_sn1_rt_vpn" {
  route_table_id         = aws_route_table.lvt_network_sn1_rt.id
  destination_cidr_block = var.openvpn_cidr
  network_interface_id   = var.instance_network_interface_id
}

resource "aws_route_table" "lvt_network_sn2_rt" {
  vpc_id = aws_vpc.lvt_network.id

  tags = {
    Name = "${var.sn2_name}-rt"
  }
}

resource "aws_route" "lvt_network_sn2_rt_internet" {
  route_table_id         = aws_route_table.lvt_network_sn2_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.lvt_network_igw.id
}

resource "aws_route" "lvt_network_sn2_rt_vpn" {
  route_table_id         = aws_route_table.lvt_network_sn2_rt.id
  destination_cidr_block = var.openvpn_cidr
  network_interface_id   = var.instance_network_interface_id
}

resource "aws_route_table_association" "lvt_network_sn1_rta" {
  subnet_id      = aws_subnet.lvt_network_sn1.id
  route_table_id = aws_route_table.lvt_network_sn1_rt.id
}

resource "aws_route_table_association" "lvt_network_sn2_rta" {
  subnet_id      = aws_subnet.lvt_network_sn2.id
  route_table_id = aws_route_table.lvt_network_sn2_rt.id
}

resource "aws_vpc_endpoint" "lvt_root_vpc_s3" {
  vpc_id       = aws_vpc.lvt_network.id
  service_name = "com.amazonaws.${var.region}.s3"
  route_table_ids = [
    aws_route_table.lvt_network_sn1_rt.id,
    aws_route_table.lvt_network_sn2_rt.id
  ]

  tags = {
    Name = "${var.vpc_name}-ep"
  }
}
