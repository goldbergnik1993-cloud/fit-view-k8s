variable "database_url" {
  type      = string
  sensitive = true
}

variable "pghost" {
  type = string
}

variable "pgdatabase" {
  type = string
}

variable "pguser" {
  type = string
}

variable "pgpassword" {
  type      = string
  sensitive = true
}

variable "app_secret_key" {
  type      = string
  sensitive = true
}

variable "stripe_secret_key" {
  type      = string
  sensitive = true
  default   = "sk_test_dummy"
}

variable "stripe_publishable_key" {
  type    = string
  default = "pk_test_dummy"
}

variable "stripe_webhook_secret" {
  type      = string
  sensitive = true
  default   = "whsec_dummy"
}

variable "github_actions_role_arn" {
  type    = string
  default = "arn:aws:iam::133897766361:role/github-actions-deploy-role"
}
