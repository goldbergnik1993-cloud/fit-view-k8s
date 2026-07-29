locals {
  azs = slice(data.aws_availability_zones.available.names, 0, var.az_count)
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project}-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.project}-igw"
  }
}

resource "aws_subnet" "public" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                     = "${var.project}-public-${local.azs[count.index]}"
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_subnet" "private" {
  count             = var.az_count
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = local.azs[count.index]

  tags = {
    Name                              = "${var.project}-private-${local.azs[count.index]}"
    "kubernetes.io/role/internal-elb" = "1"
    "karpenter.sh/discovery"          = var.cluster_name
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.project}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = var.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.project}-private-rt"
  }
}

resource "aws_route" "private_nat" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  network_interface_id   = aws_instance.nat.primary_network_interface_id
}

resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

data "aws_ssm_parameter" "al2023_arm64" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

resource "aws_instance" "nat" {
  ami                    = data.aws_ssm_parameter.al2023_arm64.value
  instance_type          = var.nat_instance_type
  subnet_id              = aws_subnet.public[1].id
  vpc_security_group_ids = [aws_security_group.nat.id]
  iam_instance_profile   = aws_iam_instance_profile.nat.name
  source_dest_check      = false

  user_data = <<-EOF
    #!/bin/bash
    dnf install -y iptables
    modprobe nf_conntrack
    echo "nf_conntrack" > /etc/modules-load.d/nf_conntrack.conf
    sysctl -w net.ipv4.ip_forward=1
    echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
    IFACE=$(ip route show default | awk '{print $5}' | head -1)
    iptables -t nat -A POSTROUTING -o "$IFACE" -j MASQUERADE
    mkdir -p /etc/systemd/scripts
    cat > /etc/systemd/scripts/nat-iptables.sh <<'SCRIPT'
    #!/bin/bash
    sysctl -w net.ipv4.ip_forward=1
    IFACE=""
    for i in $(seq 1 30); do
      IFACE=$(ip route show default | awk '{print $5}' | head -1)
      [ -n "$IFACE" ] && break
      sleep 1
    done
    iptables -t nat -C POSTROUTING -o "$IFACE" -j MASQUERADE 2>/dev/null || iptables -t nat -A POSTROUTING -o "$IFACE" -j MASQUERADE
    SCRIPT
    chmod +x /etc/systemd/scripts/nat-iptables.sh
    cat > /etc/systemd/system/nat-iptables.service <<'UNIT'
    [Unit]
    Description=Restore NAT iptables rules on boot
    After=network-online.target
    Wants=network-online.target
    [Service]
    Type=oneshot
    ExecStart=/etc/systemd/scripts/nat-iptables.sh
    [Install]
    WantedBy=multi-user.target
    UNIT
    systemctl enable nat-iptables.service
  EOF

  tags = {
    Name = "${var.project}-nat-instance"
  }
}

resource "aws_eip" "nat" {
  instance = aws_instance.nat.id
  domain   = "vpc"

  tags = {
    Name = "${var.project}-nat-eip"
  }
}

resource "aws_eip" "nlb" {
  domain = "vpc"

  tags = {
    Name = "${var.project}-nlb-eip"
  }
}
