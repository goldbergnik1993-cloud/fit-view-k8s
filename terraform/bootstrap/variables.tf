variable "region" {
  type    = string
  default = "eu-central-1"
}

variable "state_bucket_name" {
  type    = string
  default = "fitview-tfstate-133897766361"
}

variable "lock_table_name" {
  type    = string
  default = "fitview-tf-lock"
}
