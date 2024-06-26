
module "serverless_inference_deploy" {
  source = "github.com/kookmin-sw/capstone-2024-12//IaC/serverless_api_template"
  prefix = "serverless_inference_deploy"
  container_registry = var.container_registry
  container_repository = "serverless-inference-deploy"
  container_image_tag = "latest"
  lambda_ram_size = 2048
  lambda_timeout = 600
  attach_iam_policy = true
  attach_s3_policy = true
  attach_ec2_policy = true
  attach_lambda_policy = true
  attach_cloudwatch_policy = true
  state_bucket_name = var.state_bucket_name
  db_api_url = var.db_api_url
  region_name = var.region
}

output "function_url" {
  value = module.serverless_inference_deploy.function_url
}

# provider "aws" {
#     region = var.region
#     profile = var.awscli_profile
# }

terraform {
  backend "s3" {
    bucket = "sskai-terraform-state"
    key = "serverless_inference_deploy/tf.state"
    region = "ap-northeast-2"
    encrypt = true
  }
}