resource "aws_security_group" "cloudroute_nsg" {
  name        = "vpn-server-nsg"
  description = "Network Security Group for vpn-server"
  vpc_id      = aws_vpc.cloudroute_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.cidr_anywhere]
  }
  ingress {
    from_port = 4433
    to_port   = 4433
    protocol  = "tcp"
    # cidr_blocks = [var.cidr_anywhere]
    cidr_blocks = [var.cidr_vpc]
  }
  ingress {
    from_port   = 1194
    to_port     = 1194
    protocol    = "udp"
    cidr_blocks = [var.cidr_anywhere]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.cidr_anywhere]
  }

  tags = {
    Name        = "vpn-server-nsg"
    Application = "cloudroute"
    Environment = var.environment
  }
}

resource "tls_private_key" "cloudroute_tsl_private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "cloudroute_key_pair" {
  key_name   = "vpn-server"
  public_key = tls_private_key.cloudroute_tsl_private_key.public_key_openssh

  tags = {
    Name        = "vpn-server-key-pair"
    Application = "cloudroute"
    Environment = var.environment
  }
}

resource "local_file" "cloudroute_local_file_openssh" {
  content  = tls_private_key.cloudroute_tsl_private_key.private_key_openssh
  filename = "${path.root}/../logins/vpn-server.${var.environment}.openssh.pem"
}
resource "local_file" "cloudroute_local_file" {
  content  = tls_private_key.cloudroute_tsl_private_key.private_key_pem
  filename = "${path.root}/../logins/vpn-server.${var.environment}.pem"
}
resource "local_file" "cloudroute_local_file_pkcs8" {
  content  = tls_private_key.cloudroute_tsl_private_key.private_key_pem_pkcs8
  filename = "${path.root}/../logins/vpn-server.${var.environment}.pkcs8.pem"
}

resource "aws_eip" "cloudroute_eip" {
  instance = aws_instance.cloudroute_vm.id

  tags = {
    Name        = "vpn-server-eip"
    Application = "cloudroute"
    Environment = var.environment
  }
}

resource "aws_instance" "cloudroute_vm" {
  ami                    = var.vm_ami
  instance_type          = var.vm_instance_type
  key_name               = aws_key_pair.cloudroute_key_pair.key_name
  vpc_security_group_ids = [aws_security_group.cloudroute_nsg.id]
  subnet_id              = aws_subnet.cloudroute_vpc_subnet.id

  associate_public_ip_address = true

  root_block_device {
    volume_size = var.vm_volume_size
    volume_type = var.vm_volume_type
    tags = {
      Name        = "vpn-server-block-device"
      Application = "cloudroute"
      Environment = var.environment
    }
  }

  tags = {
    Name        = "vpn-server"
    Application = "cloudroute"
    Environment = var.environment
  }
}

resource "aws_route" "cloudroute_route_openvpn" {
  route_table_id         = aws_route_table.cloudroute_vpc_subnet_rt.id
  destination_cidr_block = var.cidr_openvpn
  network_interface_id   = aws_instance.cloudroute_vm.primary_network_interface_id
}

resource "null_resource" "cloudroute_after_script" {
  depends_on = [aws_instance.cloudroute_vm]

  provisioner "local-exec" {
    command = "./vm.after.sh ${aws_instance.cloudroute_vm.id} ${aws_eip.cloudroute_eip.public_ip} vpn-server ${var.environment}"
  }
}
