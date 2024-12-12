module "cloudroute" {
  source = "./lvt_linux_vm"

  name          = var.VM_NAME
  ami           = var.VM_AMI
  instance_type = var.VM_INSTANCE_TYPE

  root_volume_size            = var.VM_VOLUME_SIZE
  root_volume_type            = var.VM_VOLUME_TYPE
  vpc_id                      = module.lvt-root.vpc_id
  subnet_id                   = module.lvt-root.subnet_sn1_id
  associate_public_ip_address = true
  snapshot                    = var.VM_SNAPSHOT

  ingress_rules = [
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.VM_IN_SSH_CIDR]
    },
    {
      from_port   = 1194
      to_port     = 1194
      protocol    = "udp"
      cidr_blocks = [var.ANYWHERE_CIDR]
    },
    {
      from_port   = 4433
      to_port     = 4433
      protocol    = "tcp"
      cidr_blocks = [var.VM_IN_WEB_CIDR]
    },
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = [var.VPC_CIDR]
    }
  ]
  egress_rules = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

resource "null_resource" "cloudroute_after" {
  depends_on = [module.cloudroute]

  provisioner "local-exec" {
    command = "./cloudroute.after.sh ${module.cloudroute.instance_id} ${module.cloudroute.instance_eip_address} ${module.cloudroute.name}"
  }
}
