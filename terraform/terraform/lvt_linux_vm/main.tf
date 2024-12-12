resource "aws_security_group" "lvt_linux_vm_nsg" {
  name        = "${var.name}-nsg"
  description = "Network Security Group for ${var.name}"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
    }
  }

  dynamic "egress" {
    for_each = var.egress_rules
    content {
      from_port   = egress.value.from_port
      to_port     = egress.value.to_port
      protocol    = egress.value.protocol
      cidr_blocks = egress.value.cidr_blocks
    }
  }
}

resource "tls_private_key" "lvt_linux_vm_tsl_private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "lvt_linux_vm_aws_key_pair" {
  key_name   = var.name
  public_key = tls_private_key.lvt_linux_vm_tsl_private_key.public_key_openssh
}

resource "local_file" "lvt_linux_vm_local_file_openssh" {
  content  = tls_private_key.lvt_linux_vm_tsl_private_key.private_key_openssh
  filename = "${path.root}/../logins/${var.name}.openssh.pem"
}
resource "local_file" "lvt_linux_vm_local_file" {
  content  = tls_private_key.lvt_linux_vm_tsl_private_key.private_key_pem
  filename = "${path.root}/../logins/${var.name}.pem"
}
resource "local_file" "lvt_linux_vm_local_file_pkcs8" {
  content  = tls_private_key.lvt_linux_vm_tsl_private_key.private_key_pem_pkcs8
  filename = "${path.root}/../logins/${var.name}.pkcs8.pem"
}

resource "aws_eip" "lvt_linux_vm_eip" {
  count    = var.associate_public_ip_address ? 1 : 0
  instance = aws_instance.lvt_linux_vm.id
}

resource "aws_instance" "lvt_linux_vm" {
  ami                    = var.ami
  instance_type          = var.instance_type
  key_name               = aws_key_pair.lvt_linux_vm_aws_key_pair.key_name
  vpc_security_group_ids = [aws_security_group.lvt_linux_vm_nsg.id]
  subnet_id              = var.subnet_id

  associate_public_ip_address = var.associate_public_ip_address

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = var.root_volume_type
    tags = {
      "Name"      = "${var.name}"
      snapshot    = var.snapshot
      application = "cloudroute"
    }
  }

  private_dns_name_options {
    enable_resource_name_dns_a_record    = true
    enable_resource_name_dns_aaaa_record = false
    hostname_type                        = "resource-name"
  }

  tags = {
    Name        = var.name
    application = "cloudroute"
  }
}
