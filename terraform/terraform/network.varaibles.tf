variable "vpc_subnet_az" { type = string }
variable "cidr_openvpn" { type = string }
variable "cidr_vpc" { type = string }
variable "cidr_vpc_subnet" { type = string }
variable "cidr_anywhere" {
  type    = string
  default = "0.0.0.0/0"
}
