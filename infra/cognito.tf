# Cognito User Pool — handles all authentication (foster parents, staff, therapists).
# The app DB (see rds.tf) never stores passwords; users.cognito_sub links the two.

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}"

  username_attributes     = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = true
  }

  # Staff/management roles should require MFA per the brief's security section;
  # foster parents can opt in. Enforcing "required for all" here is the simplest
  # safe default — split into a staff-only pool later if parent UX friction matters.
  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  generate_secret                     = false
  prevent_user_existence_errors       = "ENABLED"
  access_token_validity               = 1
  id_token_validity                   = 1
  refresh_token_validity              = 30
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.web.id
}
