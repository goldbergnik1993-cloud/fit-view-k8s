output "cluster_name" {
  value = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.this.endpoint
}

output "vpc_id" {
  value = aws_vpc.this.id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "nat_public_ip" {
  value = aws_eip.nat.public_ip
}

output "nlb_eip_allocation_id" {
  value = aws_eip.nlb.id
}

output "nlb_eip_public_ip" {
  value = aws_eip.nlb.public_ip
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "site_public_ip" {
  description = "Static IP the ingress-nginx NLB is pinned to; open this directly in a browser (Ingress accepts any Host by default)"
  value       = aws_eip.nlb.public_ip
}
