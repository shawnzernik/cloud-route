resource "aws_vpc" "cloudroute_vpc" {
  #
  # The VPC CIDR cannot contain the OpenVPN's client CIDR.  You'll get the following error:
  #
  # Error: creating Route in Route Table (rtb-041cf6f04960d85d6) with destination (10.0.1.0/24): operation error EC2: CreateRoute, https response error StatusCode: 400, RequestID: ba560b0f-40c3-4df6-b578-131e9fc18b0b, api error InvalidParameterValue: Route destination doesn't match any subnet CIDR blocks.
  #
  # OpenVPN Clients: 10.0.1.0/24
  # CloudRoute Network: 10.0.0.0/24
  #
  cidr_block           = var.cidr_vpc
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "cloudroute-vpc"
    Application = "cloudroute"
    Environment = var.environment
  }
}

# Subnet
resource "aws_subnet" "cloudroute_vpc_subnet" {
  vpc_id                  = aws_vpc.cloudroute_vpc.id
  cidr_block              = var.cidr_vpc_subnet
  availability_zone       = var.vpc_subnet_az
  map_public_ip_on_launch = false

  tags = {
    Name        = "cloudroute-vpc-subnet"
    Application = "cloudroute"
    Environment = var.environment
  }
}

# Route Table
resource "aws_route_table" "cloudroute_vpc_subnet_rt" {
  vpc_id = aws_vpc.cloudroute_vpc.id

  tags = {
    Name        = "cloudroute-vpc-subnet-rt"
    Application = "cloudroute"
    Environment = var.environment
  }
}
resource "aws_route_table_association" "cloudroute_subnet_tra" {
  subnet_id      = aws_subnet.cloudroute_vpc_subnet.id
  route_table_id = aws_route_table.cloudroute_vpc_subnet_rt.id
}

# Internet Gateway
resource "aws_internet_gateway" "cloudroute_vpc_igw" {
  vpc_id = aws_vpc.cloudroute_vpc.id

  tags = {
    Name        = "cloudroute-vpc-igw"
    Application = "cloudroute"
    Environment = var.environment
  }
}
resource "aws_route" "cloudroute_vpc_subnet_rt_internet" {
  route_table_id         = aws_route_table.cloudroute_vpc_subnet_rt.id
  destination_cidr_block = var.cidr_anywhere
  gateway_id             = aws_internet_gateway.cloudroute_vpc_igw.id
}

# S3 Buckets
resource "aws_vpc_endpoint" "cloudroute_vpc_subnet_rt_s3" {
  vpc_id          = aws_vpc.cloudroute_vpc.id
  service_name    = "com.amazonaws.us-west-2.s3"
  route_table_ids = [aws_route_table.cloudroute_vpc_subnet_rt.id]

  tags = {
    Name        = "cloudroute-vpc-ep"
    Application = "cloudroute"
    Environment = var.environment
  }
}
