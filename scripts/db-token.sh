#!/bin/bash
# Generates a fresh RDS IAM auth token and sets DATABASE_URL.
# Usage: source scripts/db-token.sh
# Then run: npm run db:push  OR  npm run db:migrate

RDS_HOST="database-1.cluster-c2t6oaeuaoq9.us-east-1.rds.amazonaws.com"
RDS_PORT=5432
RDS_DATABASE="postgres"
RDS_USERNAME="newsletter_studio"
AWS_REGION="us-east-1"

TOKEN=$(aws rds generate-db-auth-token \
  --hostname "$RDS_HOST" \
  --port $RDS_PORT \
  --username "$RDS_USERNAME" \
  --region "$AWS_REGION")

export DATABASE_URL="postgres://${RDS_USERNAME}:${TOKEN}@${RDS_HOST}:${RDS_PORT}/${RDS_DATABASE}?sslmode=require"

echo "DATABASE_URL set (token valid for 15 min)"
