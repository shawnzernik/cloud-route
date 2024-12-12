output "security_group_id" {
  value = aws_security_group.lvt_linux_vm_nsg.id
}

output "tls_private_key_pem" {
  value     = tls_private_key.lvt_linux_vm_tsl_private_key.private_key_pem
  sensitive = true
}

output "key_pair_name" {
  value = aws_key_pair.lvt_linux_vm_aws_key_pair.key_name
}

output "instance_id" {
  value = aws_instance.lvt_linux_vm.id
}

output "instance_eip_address" {
  value = var.associate_public_ip_address ? aws_eip.lvt_linux_vm_eip[0].public_ip : ""
}


output "instance_public_ip" {
  value = aws_instance.lvt_linux_vm.public_ip
}

output "instance_private_ip" {
  value = aws_instance.lvt_linux_vm.private_ip
}

output "instance_ami" {
  value = aws_instance.lvt_linux_vm.ami
}

output "instance_type" {
  value = aws_instance.lvt_linux_vm.instance_type
}

output "instance_primary_network_interface_id" {
  value = aws_instance.lvt_linux_vm.primary_network_interface_id
}

output "name" {
  value = var.name
}
