resource "aws_ssm_parameter" "database_url" {
  name      = "/${var.project}/staging/DATABASE_URL"
  type      = "SecureString"
  value     = var.database_url
  overwrite = true
}

resource "aws_ssm_parameter" "pghost" {
  name      = "/${var.project}/staging/PGHOST"
  type      = "String"
  value     = var.pghost
  overwrite = true
}

resource "aws_ssm_parameter" "pgdatabase" {
  name      = "/${var.project}/staging/PGDATABASE"
  type      = "String"
  value     = var.pgdatabase
  overwrite = true
}

resource "aws_ssm_parameter" "pguser" {
  name      = "/${var.project}/staging/PGUSER"
  type      = "String"
  value     = var.pguser
  overwrite = true
}

resource "aws_ssm_parameter" "pgpassword" {
  name      = "/${var.project}/staging/PGPASSWORD"
  type      = "SecureString"
  value     = var.pgpassword
  overwrite = true
}

resource "aws_ssm_parameter" "secret_key" {
  name      = "/${var.project}/staging/SECRET_KEY"
  type      = "SecureString"
  value     = var.app_secret_key
  overwrite = true
}

resource "aws_ssm_parameter" "stripe_secret_key" {
  name      = "/${var.project}/staging/STRIPE_SECRET_KEY"
  type      = "SecureString"
  value     = var.stripe_secret_key
  overwrite = true
}

resource "aws_ssm_parameter" "stripe_publishable_key" {
  name      = "/${var.project}/staging/STRIPE_PUBLISHABLE_KEY"
  type      = "String"
  value     = var.stripe_publishable_key
  overwrite = true
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name      = "/${var.project}/staging/STRIPE_WEBHOOK_SECRET"
  type      = "SecureString"
  value     = var.stripe_webhook_secret
  overwrite = true
}
