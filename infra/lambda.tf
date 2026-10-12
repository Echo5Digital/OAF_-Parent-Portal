# Lambda functions, one per handler in server/src/handlers. Packaged as a zip built
# from server/dist by `npm run build` (see server/README.md) — the `filename` here
# points at a placeholder path until that build step is wired into CI.

resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-${var.environment}-lambda"
  description = "Lambda functions — outbound only, no inbound"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-${var.environment}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_basic_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_secrets" {
  name = "read-db-secret"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [aws_secretsmanager_secret.db.arn]
    }]
  })
}

locals {
  # Shared config duplicated across all handler Lambdas.
  lambda_env = {
    DATABASE_URL          = "postgres://${var.db_username}:${random_password.db.result}@${aws_db_instance.main.endpoint}/${var.db_name}"
    COGNITO_USER_POOL_ID  = aws_cognito_user_pool.main.id
    COGNITO_CLIENT_ID     = aws_cognito_user_pool_client.web.id
    ALLOWED_ORIGIN        = var.allowed_frontend_origin
  }

  handlers = {
    getMyChildren   = { route = "GET /children" }
    getWeeklyLog    = { route = "GET /children/{childId}/weekly-log" }
    saveDailyEntry  = { route = "PUT /children/{childId}/weekly-log/days/{dayIndex}" }
    submitWeeklyLog = { route = "POST /children/{childId}/weekly-log/submit" }
  }
}

resource "aws_lambda_function" "handlers" {
  for_each = local.handlers

  function_name = "${var.project_name}-${var.environment}-${each.key}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "handlers/${each.key}.handler"
  runtime       = "nodejs20.x"
  filename      = "${path.module}/../server/dist/${each.key}.zip"
  memory_size   = 256 # smallest practical size for a simple query handler; Lambda cost is proportional to this
  timeout       = 10

  vpc_config {
    subnet_ids         = data.aws_subnets.default.ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = local.lambda_env
  }
}

resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project_name}-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [var.allowed_frontend_origin]
    allow_headers = ["authorization", "content-type"]
    allow_methods = ["GET", "PUT", "POST", "OPTIONS"]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "handlers" {
  for_each = local.handlers

  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.handlers[each.key].invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "handlers" {
  for_each = local.handlers

  api_id    = aws_apigatewayv2_api.http.id
  route_key = each.value.route
  target    = "integrations/${aws_apigatewayv2_integration.handlers[each.key].id}"
}

resource "aws_lambda_permission" "apigw" {
  for_each = local.handlers

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handlers[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

output "api_base_url" {
  value = aws_apigatewayv2_api.http.api_endpoint
}
