output "vpc_name" {
	value = var.vpc_name
}

output "vpc_id" {
  value       = aws_vpc.lvt_network.id
}

output "vpc_cidr_block" {
  value       = aws_vpc.lvt_network.cidr_block
}

output "internet_gateway_id" {
  value       = aws_internet_gateway.lvt_network_igw.id
}

output "subnet_sn1_id" {
  value       = aws_subnet.lvt_network_sn1.id
}

output "subnet_sn1_availability_zone" {
  value       = aws_subnet.lvt_network_sn1.availability_zone
}

output "subnet_sn1_cidr_block" {
  value       = aws_subnet.lvt_network_sn1.cidr_block
}

output "subnet_sn2_id" {
  value       = aws_subnet.lvt_network_sn2.id
}

output "subnet_sn2_cidr_block" {
  value       = aws_subnet.lvt_network_sn2.cidr_block
}

output "route_table_sn1_id" {
  value       = aws_route_table.lvt_network_sn1_rt.id
}

output "route_table_sn2_id" {
  value       = aws_route_table.lvt_network_sn2_rt.id
}

output "vpc_endpoint_id" {
  value       = aws_vpc_endpoint.lvt_root_vpc_s3.id
}
