# RDS Postgres — the single biggest line item against the <$50/mo target.
# db.t4g.micro + 20GB gp3, single-AZ, no read replica: roughly $12-15/mo after the
# 12-month free tier expires (free in year one on a new AWS account). This is the
# cheapest way to get real Postgres; Aurora Serverless v2 is the alternative if
# traffic becomes spiky, but it has a higher effective floor than a t4g.micro at
# this scale (~100 users), so it is not used here. Revisit at the 300-500 user mark.

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}"
  subnet_ids = data.aws_subnets.default.ids
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds"
  description = "Allow Postgres access from Lambda only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "Postgres from Lambda"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_secretsmanager_secret" "db" {
  name = "${var.project_name}-${var.environment}-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db.result
  })
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-${var.environment}"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 50 # allows autoscaling storage instead of over-provisioning upfront
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  multi_az                = false # single-AZ keeps cost down for Phase One; revisit before production go-live
  backup_retention_period = 7
  deletion_protection     = var.environment == "prod"
  skip_final_snapshot     = var.environment != "prod"

  tags = {
    Project = var.project_name
  }
}

output "db_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}
