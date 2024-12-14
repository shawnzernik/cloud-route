resource "aws_vpc" "cloudroute_network" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "cloudroute-vpc"
  }
}

resource "aws_internet_gateway" "cloudroute_network_igw" {
  vpc_id = aws_vpc.cloudroute_network.id

  tags = {
    Name = "cloudroute-vpc-igw"
  }
}

resource "aws_subnet" "cloudroute_network_sn1" {
  vpc_id                  = aws_vpc.cloudroute_network.id
  cidr_block              = "10.0.1.0"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = false

  tags = {
    Name = "cloudroute-vpc-sn1"
  }
}

resource "aws_route_table" "cloudroute_network_sn1_rt" {
  vpc_id = aws_vpc.cloudroute_network.id

  tags = {
    Name = "cloudroute-vpc-sn1-rt"
  }
}

resource "aws_route" "cloudroute_network_sn1_rt_internet" {
  route_table_id         = aws_route_table.cloudroute_network_sn1_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.cloudroute_network_igw.id
}

resource "aws_route" "cloudroute_network_sn1_rt_vpn" {
  route_table_id         = aws_route_table.cloudroute_network_sn1_rt.id
  destination_cidr_block = "10.0.0.0/24"
  network_interface_id   = module.cloudroute.instance_primary_network_interface_id
}

resource "aws_route_table_association" "cloudroute_network_sn1_rta" {
  subnet_id      = aws_subnet.cloudroute_network_sn1.id
  route_table_id = aws_route_table.cloudroute_network_sn1_rt.id
}

resource "aws_subnet" "cloudroute_network_sn2" {
  vpc_id                  = aws_vpc.cloudroute_network.id
  cidr_block              = "10.0.2.0"
  availability_zone       = "us-west-2c"
  map_public_ip_on_launch = false

  tags = {
    Name = "cloudroute-vpc-sn2"
  }
}

resource "aws_route_table" "cloudroute_network_sn2_rt" {
  vpc_id = aws_vpc.cloudroute_network.id

  tags = {
    Name = "cloudroute-vpc-sn2-rt"
  }
}

resource "aws_route" "cloudroute_network_sn2_rt_internet" {
  route_table_id         = aws_route_table.cloudroute_network_sn2_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.cloudroute_network_igw.id
}

resource "aws_route" "cloudroute_network_sn2_rt_vpn" {
  route_table_id         = aws_route_table.cloudroute_network_sn2_rt.id
  destination_cidr_block = "10.0.0.0/24"
  network_interface_id   = module.cloudroute.instance_primary_network_interface_id
}

resource "aws_route_table_association" "cloudroute_network_sn2_rta" {
  subnet_id      = aws_subnet.cloudroute_network_sn2.id
  route_table_id = aws_route_table.cloudroute_network_sn2_rt.id
}

resource "aws_vpc_endpoint" "cloudroute_root_vpc_s3" {
  vpc_id       = aws_vpc.cloudroute_network.id
  service_name = "com.amazonaws.us-west-2.s3"
  route_table_ids = [
    aws_route_table.cloudroute_network_sn1_rt.id,
    aws_route_table.cloudroute_network_sn2_rt.id
  ]

  tags = {
    Name = "cloudroute-vpc-ep"
  }
}
