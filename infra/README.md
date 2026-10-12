# Open Arms — Infrastructure (Terraform)

Provisions the AWS serverless architecture requested in the cost-pivot direction: Cognito, RDS Postgres, Lambda, API Gateway. Matches `../server/` which contains the handler code these Lambdas run.

## This has not been applied anywhere

No `terraform apply` has been run and no AWS credentials were used to produce this. That's deliberate: Sony's project brief asks for architecture + UI sign-off before full implementation, and provisioning real AWS resources (even small ones) means real spend and a real shared account. Review this plan, get it approved, then apply it yourselves with your own AWS credentials:

```bash
cd infra
terraform init
terraform plan   # review every resource before creating anything
terraform apply
```

## What's provisioned

- **Cognito User Pool** (`cognito.tf`) — auth for all roles (parents, staff, therapists, management). MFA is optional-but-available at the pool level; the brief asks for MFA *required* for staff specifically — that split (e.g. a Cognito group with an MFA-enforcing pre-auth Lambda trigger, or two pools) is a follow-up once roles beyond foster_parent are actually being onboarded.
- **RDS Postgres** (`rds.tf`) — `db.t4g.micro`, single-AZ, 20GB gp3 autoscaling to 50GB, encrypted at rest, in a private subnet reachable only from the Lambda security group (not publicly accessible). This is the main monthly cost line — see cost estimate below.
- **Lambda + API Gateway HTTP API** (`lambda.tf`) — one function per handler, VPC-attached (required to reach RDS), minimal 256MB memory.

Not yet provisioned (follow-ups): S3 for file/signature storage, SES for notifications, SQS for background jobs, Bedrock access for AI reporting, CloudWatch alarms/budgets. These are straightforward additions once this core slice is reviewed.

## Rough monthly cost estimate (~100 users, us-east-1)

This is a planning estimate, not a quote — actual AWS billing depends on real usage. Numbers assume *after* the 12-month free tier (new accounts get RDS, Lambda, and API Gateway free-tier allowances that would push year-one cost close to $0-10/mo).

| Item | Estimate | Notes |
|---|---|---|
| RDS db.t4g.micro (single-AZ, 20GB gp3) | ~$12-15/mo | Biggest fixed cost; free for 12mo on a new account |
| Lambda invocations + compute | ~$0-2/mo | 1M free requests/mo + 400,000 GB-seconds free, permanently (not just year one) |
| API Gateway HTTP API | ~$1-3/mo | $1.00 per million requests after a small free allowance |
| Cognito User Pool | $0/mo | Free up to 50,000 MAUs |
| S3 (signatures/docs, not yet provisioned) | ~$1-2/mo | At this data volume, storage cost is negligible |
| SES (not yet provisioned) | ~$0-1/mo | 62,000 free emails/mo if sent from a Lambda/EC2 origin |
| Secrets Manager | ~$0.40/mo | One secret for DB credentials |
| CloudWatch logs | ~$1-3/mo | Depends on log retention/volume |
| Data transfer | ~$1-2/mo | Low at this scale |
| **Subtotal (infra, excl. AI)** | **~$17-28/mo** | Leaves headroom under $50 for AI usage |
| Claude via Bedrock (AI reporting) | Variable — see note | See below |

**On the $50 target:** the non-AI infrastructure above comfortably fits under $50/mo at ~100 users, even before accounting for free-tier credits. The real variable is Bedrock/Claude usage, which depends entirely on how often management runs AI reports and how much context (de-identified records, aggregates) each query sends — that needs real usage patterns to estimate credibly, and should be metered and capped (see `project_brief.md` / `architecture_budget_pivot.md` in project memory for the cost-control approach: aggregate where possible, cache non-sensitive results, monitor token usage). Recommend treating Bedrock as a separate tracked line item with a CloudWatch billing alarm rather than folding it into a single guess.

**At 300-500 users:** RDS is the first thing to revisit (likely a step up to `db.t4g.small` or a move to Aurora Serverless v2 if traffic becomes spiky/unpredictable); Lambda/API Gateway scale near-linearly and stay cheap; Cognito stays free well past this range.
