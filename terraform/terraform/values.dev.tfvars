# https://datatracker.ietf.org/doc/html/rfc1918
# 10.0.0.0 – 10.255.255.255 (10.0.0.0/8) 
# 172.16.0.0 – 172.31.255.255 (172.19.0.0/12) 
# 192.168.0.0 – 192.168.255.255 (192.168.0.0/16)

environment = "dev"
#region      = "us-west-2"

vpc_subnet_az = "us-west-2a"

cidr_openvpn    = "10.0.1.0/24"
cidr_vpc        = "10.0.0.0/24"
cidr_vpc_subnet = "10.0.0.0/24"

# "t4g.micro" = 2 ARM cpus; 1gb RAM -- production min
# "t4g.xlarge" = 4 ARM cpus; 16gb RAM -- development

vm_ami           = "ami-0c29a2c5cf69b5a9c" # Ubuntu 24
vm_instance_type = "t4g.xlarge"            # ARM 4 cpu; 16gb
vm_volume_size   = 8                       # gb
vm_volume_type   = "gp3"
