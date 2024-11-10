output "table_name" {
  value = aws_dynamodb_table.usage_metrics.name
}

output "table_arn" {
  value = aws_dynamodb_table.usage_metrics.arn
}

output "access_key_id" {
  value = aws_iam_access_key.metrics_user_key.id
}

output "secret_access_key" {
  value     = aws_iam_access_key.metrics_user_key.secret
  sensitive = true
}
