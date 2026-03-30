# Anansi Platform - Hosting Cost Estimates

Estimated monthly infrastructure costs for Dev, Staging, and Production environments. All prices in USD. Based on AWS pricing (similar costs on Azure/GCP).

---

## Summary

| Environment | Monthly Cost | Annual Cost |
|-------------|-------------|-------------|
| Development | ~$350-500 | ~$4,200-6,000 |
| Staging | ~$600-900 | ~$7,200-10,800 |
| Production (launch) | ~$2,500-4,000 | ~$30,000-48,000 |
| Production (scaled) | ~$6,000-15,000+ | ~$72,000-180,000+ |

**Combined (Dev + Staging + Prod launch): ~$3,450-5,400/mo**

---

## Infrastructure Components

### 1. Compute (App Servers)

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| API Server | 1x t3.small (2 vCPU, 2GB) | 1x t3.medium (2 vCPU, 4GB) | 2x t3.large (2 vCPU, 8GB) + ALB |
| Web Frontend (SSR/CDN) | 1x t3.micro | 1x t3.small | CloudFront + S3 static |
| Background Workers | 1x t3.micro | 1x t3.small | 2x t3.medium |
| Video Transcoding | On-demand Lambda | On-demand Lambda | MediaConvert or dedicated |
| **Monthly** | **~$45** | **~$85** | **~$400-700** |

### 2. Database

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| PostgreSQL (RDS) | 1x db.t3.micro (free tier eligible) | 1x db.t3.small | 1x db.r6g.large (Multi-AZ) |
| Storage | 20GB gp3 | 50GB gp3 | 200GB gp3 + auto-scaling |
| Backups | 7-day retention | 7-day retention | 30-day retention + cross-region |
| Read Replicas | None | None | 1x read replica |
| **Monthly** | **~$15-25** | **~$50-70** | **~$400-600** |

### 3. Object Storage (Photos & Videos)

This is the largest cost driver for a photography platform.

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| S3 Standard | 50GB test data | 200GB test data | Scales with users |
| S3 Intelligent-Tiering | N/A | N/A | Enabled (auto-tiering for inactive galleries) |
| Transfer Out | Minimal | Minimal | Highly variable |
| **Monthly** | **~$5** | **~$10** | **~$200-2,000+** |

**Production storage cost projections by user count:**

| Users | Avg Storage/User | Total Storage | Storage Cost | Transfer (est.) | Total |
|-------|-----------------|---------------|-------------|----------------|-------|
| 100 | 15GB | 1.5TB | ~$35 | ~$100 | ~$135 |
| 500 | 15GB | 7.5TB | ~$175 | ~$400 | ~$575 |
| 1,000 | 20GB | 20TB | ~$460 | ~$900 | ~$1,360 |
| 5,000 | 25GB | 125TB | ~$2,875 | ~$4,000 | ~$6,875 |

### 4. CDN (Content Delivery)

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| CloudFront | Not used | Basic distribution | Full distribution, all edge locations |
| Requests | N/A | Minimal | Variable |
| Data Transfer | N/A | Minimal | Largest variable cost |
| **Monthly** | **$0** | **~$5** | **~$200-1,500+** |

### 5. Cache (Redis)

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| ElastiCache Redis | 1x cache.t3.micro | 1x cache.t3.small | 1x cache.r6g.large (Multi-AZ) |
| Use | Sessions, rate limiting | Same | Sessions, rate limiting, gallery caching |
| **Monthly** | **~$15** | **~$30** | **~$200-300** |

### 6. Email (Transactional)

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| Provider | SES (sandbox) | SES | SES or SendGrid |
| Volume | <100/day | <500/day | Variable |
| **Monthly** | **~$0** | **~$5** | **~$25-100** |

### 7. Search

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| OpenSearch/Elasticsearch | None (use DB queries) | 1x t3.small.search | 2x m6g.large.search |
| Use | N/A | Gallery/contact search | Full-text search across all entities |
| **Monthly** | **$0** | **~$50** | **~$250-400** |

### 8. Queue / Job Processing

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| SQS / SNS | Free tier | Free tier | Standard usage |
| Use | Async jobs (email, transcoding, fulfillment) | Same | Same at scale |
| **Monthly** | **~$0** | **~$1** | **~$10-30** |

### 9. DNS & SSL

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| Route 53 | 1 hosted zone | 1 hosted zone | Multiple zones (custom domains) |
| ACM (SSL) | Free | Free | Free (managed certs) |
| **Monthly** | **~$1** | **~$1** | **~$5-20** |

### 10. Monitoring & Logging

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| CloudWatch | Basic | Basic | Detailed metrics + alarms |
| Log aggregation | CloudWatch Logs | CloudWatch Logs | CloudWatch + Datadog/Grafana Cloud |
| Error tracking | Sentry (free) | Sentry (free) | Sentry (team) |
| Uptime monitoring | None | Basic | Multi-region checks |
| **Monthly** | **~$5** | **~$15** | **~$100-300** |

### 11. CI/CD & DevOps

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| GitHub Actions | Free tier | Free tier | Team plan |
| Container Registry (ECR) | Shared | Shared | Shared |
| IaC (Terraform state) | S3 + DynamoDB | Shared | Shared |
| **Monthly** | **~$5** | **~$5** | **~$20-50** |

### 12. Video Transcoding

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| AWS MediaConvert / Lambda | On-demand | On-demand | On-demand |
| Volume | Minimal testing | Minimal testing | Per upload (4K support) |
| **Monthly** | **~$1** | **~$5** | **~$50-300** |

---

## Environment Totals (Detailed)

### Development (~$350-500/mo)

Minimal resources for active development and testing. Single instances, no redundancy.

| Category | Cost |
|----------|------|
| Compute | $45 |
| Database | $20 |
| Object Storage | $5 |
| CDN | $0 |
| Cache (Redis) | $15 |
| Email | $0 |
| Search | $0 |
| Queues | $0 |
| DNS/SSL | $1 |
| Monitoring | $5 |
| CI/CD | $5 |
| Video Transcoding | $1 |
| **Subtotal** | **~$97** |
| Buffer/misc (20%) | ~$20 |
| **Domain registrations, SaaS tools** | ~$250 |
| **Total** | **~$350-500** |

### Staging (~$600-900/mo)

Mirrors production architecture at reduced scale. Used for QA and pre-release validation.

| Category | Cost |
|----------|------|
| Compute | $85 |
| Database | $60 |
| Object Storage | $10 |
| CDN | $5 |
| Cache (Redis) | $30 |
| Email | $5 |
| Search | $50 |
| Queues | $1 |
| DNS/SSL | $1 |
| Monitoring | $15 |
| CI/CD | $5 |
| Video Transcoding | $5 |
| **Subtotal** | **~$272** |
| Buffer/misc (20%) | ~$55 |
| **SaaS tools, test accounts** | ~$300 |
| **Total** | **~$600-900** |

### Production - Launch (~$2,500-4,000/mo)

Production-ready with Multi-AZ database, load balancing, CDN, and monitoring. Sized for initial launch (0-500 users).

| Category | Cost |
|----------|------|
| Compute | $550 |
| Database | $500 |
| Object Storage | $300 |
| CDN | $300 |
| Cache (Redis) | $250 |
| Email | $50 |
| Search | $300 |
| Queues | $20 |
| DNS/SSL | $10 |
| Monitoring | $200 |
| CI/CD | $30 |
| Video Transcoding | $100 |
| **Subtotal** | **~$2,610** |
| Buffer/misc (15%) | ~$390 |
| **Total** | **~$2,500-4,000** |

---

## Third-Party Service Costs (All Environments)

These are not hosting costs but impact total operational spend.

| Service | Purpose | Cost Model |
|---------|---------|------------|
| Stripe | Payment processing | 2.9% + $0.30 per transaction (pass-through) |
| SendGrid/SES | Transactional email | $0-100/mo depending on volume |
| Sentry | Error tracking | Free-$26/mo per plan |
| GitHub | Source control + CI | $4/user/mo (Team) |
| Figma | Design | $15/editor/mo |
| Print Lab APIs | Fulfillment | Per-order (pass-through to photographer) |
| Google Maps API | Neighborhood/location | ~$2-50/mo depending on geocoding volume |
| Twilio (optional) | SMS notifications | $0.0079/msg |

---

## Cost Optimization Strategies

1. **Reserved Instances** - Commit to 1-year RI for production DB and compute for ~30-40% savings
2. **S3 Intelligent-Tiering** - Auto-moves inactive gallery data to cheaper tiers
3. **Spot Instances** - Use for background workers and video transcoding (up to 90% savings)
4. **CloudFront caching** - Aggressive cache policies for gallery images reduce S3 transfer costs
5. **Right-sizing** - Monitor utilization quarterly and adjust instance sizes
6. **Auto-scaling** - Scale compute based on demand rather than provisioning for peak
7. **Gallery expiration** - Expired gallery storage can be moved to Glacier ($0.004/GB vs $0.023/GB)

---

## Notes

- All estimates assume AWS us-east-1 region pricing as of early 2026
- Production costs scale significantly with user count and storage volume
- Photo/video storage and CDN transfer are the dominant variable costs
- Costs exclude developer salaries, domain purchases, and business software
- Free tier benefits (first 12 months) not factored into estimates
- Consider AWS Activate or startup credits programs to offset initial costs
