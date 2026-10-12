variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix resources"
  type        = string
  default     = "open-arms"
}

variable "environment" {
  description = "Deployment environment (dev/staging/prod)"
  type        = string
  default     = "dev"
}

variable "db_name" {
  description = "Postgres database name"
  type        = string
  default     = "open_arms"
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "oaf_admin"
}

variable "allowed_frontend_origin" {
  description = "CORS origin allowed to call the API (the deployed frontend URL)"
  type        = string
  default     = "http://localhost:5173"
}

variable "db_instance_class" {
  description = "RDS instance class. db.t4g.micro is the cheapest burstable Postgres-compatible class and is Free-Tier eligible for 12 months on a new AWS account."
  type        = string
  default     = "db.t4g.micro"
}
