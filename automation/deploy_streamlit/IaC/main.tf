module "deploy_streamlit" {
  source                     = "github.com/kookmin-sw/capstone-2024-12//IaC/serverless_api_template"
  prefix                     = "deploy_streamlit"
  container_registry         = var.container_registry
  container_repository       = "deploy-streamlit"
  container_image_tag        = "latest"
  lambda_ram_size            = 256
  attach_s3_policy           = true
  attach_ec2_policy          = true
  attach_eks_policy          = true
  attach_ssm_readonly_policy = true
  region_name = var.region
  eks_cluster_name = var.eks_cluster_name
  db_api_url = var.db_api_url
}

output "streamlit_function_url" {
  value = module.deploy_streamlit.function_url
}

# provider "aws" {
#   region  = var.region
#   profile = var.awscli_profile
# }

terraform {
  backend "s3" {
    bucket  = "sskai-terraform-state"
    key     = "deploy_streamlit/tf.state"
    region  = "ap-northeast-2"
    encrypt = true
  }
}
