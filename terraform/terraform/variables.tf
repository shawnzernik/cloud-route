variable "STATE_BUCKET" {
  description = "Environment variable TF_VAR_STATE_BUCKET"
  default     = ""
}

variable "STATE_KEY" {
  description = "Environment variable TF_VAR_STATE_KEY"
  default     = ""
}

variable "REGION" {
  description = "Environment variable TF_VAR_REGION"
  default     = ""
}

variable "ANYWHERE_CIDR" {
  description = "Environment variable TF_VAR_ANYWHERE_CIDR"
  default     = ""
}

variable "VPC_CIDR" {
  description = "Environment variable TF_VAR_VPC_CIDR"
  default     = ""
}

variable "VPC_NAME" {
  description = "Environment variable TF_VAR_VPC_NAME"
  default     = ""
}

variable "SN1_NAME" {
  description = "Environment variable TF_VAR_SN1_NAME"
  default     = ""
}

variable "SN1_CIDR" {
  description = "Environment variable TF_VAR_SN1_CIDR"
  default     = ""
}

variable "SN1_AZ" {
  description = "Environment variable TF_VAR_SN1_AZ"
  default     = ""
}

variable "SN2_NAME" {
  description = "Environment variable TF_VAR_SN2_NAME"
  default     = ""
}

variable "SN2_CIDR" {
  description = "Environment variable TF_VAR_SN2_CIDR"
  default     = ""
}

variable "SN2_AZ" {
  description = "Environment variable TF_VAR_SN2_AZ"
  default     = ""
}

variable "OPENVPN_CIDR" {
  description = "Environment variable TF_VAR_OPENVPN_CIDR"
  default     = ""
}

variable "VM_NAME" {
  description = "Environment variable TF_VAR_VM_NAME"
  default     = ""
}

variable "VM_AMI" {
  description = "Environment variable TF_VAR_VM_AMI"
  default     = ""
}

variable "VM_INSTANCE_TYPE" {
  description = "Environment variable TF_VAR_VM_INSTANCE_TYPE"
  default     = ""
}

variable "VM_VOLUME_SIZE" {
  description = "Environment variable TF_VAR_VM_VOLUME_SIZE"
  default     = ""
}

variable "VM_VOLUME_TYPE" {
  description = "Environment variable TF_VAR_VM_VOLUME_TYPE"
  default     = ""
}

variable "VM_SNAPSHOT" {
  description = "Environment variable TF_VAR_VM_SNAPSHOT"
  default     = ""
}

variable "VM_IN_VPN_CIDR" {
  description = "Environment variable TF_VAR_VM_IN_VPN_CIDR"
  default     = ""
}

variable "VM_IN_SSH_CIDR" {
  description = "Environment variable TF_VAR_VM_IN_SSH_CIDR"
  default     = ""
}

variable "VM_IN_WEB_CIDR" {
  description = "Environment variable TF_VAR_VM_IN_WEB_CIDR"
  default     = ""
}
