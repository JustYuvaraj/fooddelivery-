# Deployment Guide: Food Delivery Application

## Overview

This guide provides step-by-step instructions for deploying the Food Delivery application (frontend and backend) to production environments.

---

## Prerequisites

### Backend Requirements
- Java 17 or higher
- Maven 3.8+
- PostgreSQL 12+
- Redis 6+
- Spring Boot 3.2.0

### Frontend Requirements
- Node.js 18+
- npm 9+
- Vite
- React 18

### Infrastructure
- Docker (optional but recommended)
- Docker Compose (for local development)
- Cloud provider account (AWS, GCP, Azure, or similar)

---

## Part 1: Backend Deployment

### 1.1 Build Backend

```bash
cd backend
mvn clean package -DskipTests
```

This creates a JAR file at: `target/fooddelivery-backend-1.0.0.jar`

### 1.2 Environment Configuration

Create `.env` file in backend root:

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://db-host:5432/fooddelivery
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your-secure-password
SPRING_JPA_HIBERNATE_DDL_AUTO=validate

# Redis
SPRING_REDIS_HOST=redis-host
SPRING_REDIS_PORT=6379
SPRING_REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-very-long-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080
SERVER_SERVLET_CONTEXT_PATH=/api

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_FOODDELIVERY=DEBUG
```

### 1.3 Docker Setup (Recommended)

Create `Dockerfile`:

```dockerfile
FROM openjdk:17-slim

WORKDIR /app

COPY target/fooddelivery-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fooddelivery
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/fooddelivery
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 1.4 Deploy to Cloud

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p "Java 17 running on 64bit Amazon Linux 2" fooddelivery-backend

# Create environment
eb create fooddelivery-prod

# Deploy
eb deploy

# View logs
eb logs
```

#### Google Cloud Run
```bash
# Build and push Docker image
gcloud builds submit --tag gcr.io/PROJECT_ID/fooddelivery-backend

# Deploy
gcloud run deploy fooddelivery-backend \
  --image gcr.io/PROJECT_ID/fooddelivery-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars SPRING_DATASOURCE_URL=jdbc:postgresql://... \
  --memory 1Gi \
  --cpu 1
```

#### Azure App Service
```bash
# Create resource group
az group create --name fooddelivery-rg --location eastus

# Create App Service plan
az appservice plan create --name fooddelivery-plan \
  --resource-group fooddelivery-rg --sku B2 --is-linux

# Create web app
az webapp create --resource-group fooddelivery-rg \
  --plan fooddelivery-plan --name fooddelivery-backend \
  --runtime "JAVA|17-java17"

# Deploy JAR
az webapp deployment source config-zip \
  --resource-group fooddelivery-rg \
  --name fooddelivery-backend \
  --src target/fooddelivery-backend-1.0.0.jar
```

---

## Part 2: Frontend Deployment

### 2.1 Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates optimized build at: `dist/`

### 2.2 Environment Configuration

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=error
```

### 2.3 Deploy to CDN

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### AWS S3 + CloudFront
```bash
# Create S3 bucket
aws s3 mb s3://fooddelivery-frontend

# Upload build files
aws s3 sync dist/ s3://fooddelivery-frontend --delete

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name fooddelivery-frontend.s3.amazonaws.com
```

#### GitHub Pages
```bash
# Update package.json
"homepage": "https://yourusername.github.io/fooddelivery"

# Build and deploy
npm run build
npm run deploy
```

---

## Part 3: Database Setup

### 3.1 PostgreSQL Setup

```sql
-- Create database
CREATE DATABASE fooddelivery;

-- Create user
CREATE USER fooddelivery_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fooddelivery TO fooddelivery_user;

-- Connect to database
\c fooddelivery

-- Create schema
CREATE SCHEMA fooddelivery;

-- Grant schema privileges
GRANT ALL ON SCHEMA fooddelivery TO fooddelivery_user;
```

### 3.2 Run Migrations

Spring Boot will automatically run Flyway/Liquibase migrations on startup.

Ensure `application.yml` has:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    locations: classpath:db/migration
```

---

## Part 4: SSL/TLS Configuration

### 4.1 Generate SSL Certificate

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com

# Certificate location: /etc/letsencrypt/live/yourdomain.com/
```

### 4.2 Configure Backend SSL

Update `application.yml`:

```yaml
server:
  ssl:
    key-store: /path/to/keystore.p12
    key-store-password: password
    key-store-type: PKCS12
    key-alias: tomcat
  port: 8443
```

### 4.3 Configure Frontend HTTPS

Most CDN providers (Netlify, Vercel, AWS CloudFront) automatically provide HTTPS.

---

## Part 5: Monitoring & Logging

### 5.1 Application Monitoring

#### Spring Boot Actuator
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

Access metrics at: `https://yourdomain.com/actuator/metrics`

#### Prometheus Setup
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fooddelivery-backend'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/actuator/prometheus'
```

#### Grafana Dashboard
1. Add Prometheus data source
2. Import dashboard: `https://grafana.com/grafana/dashboards/`
3. Create custom dashboards for application metrics

### 5.2 Logging

#### ELK Stack (Elasticsearch, Logstash, Kibana)
```yaml
logging:
  level:
    root: INFO
    com.fooddelivery: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30
```

#### CloudWatch (AWS)
```yaml
logging:
  config: classpath:logback-spring.xml
```

### 5.3 Error Tracking

#### Sentry Integration
```yaml
sentry:
  dsn: https://your-sentry-dsn@sentry.io/project-id
  environment: production
  traces-sample-rate: 0.1
```

---

## Part 6: Performance Optimization

### 6.1 Backend Optimization

```yaml
server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    max-connections: 10000
    accept-count: 100

spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 20000
  redis:
    timeout: 2000ms
    jedis:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
```

### 6.2 Frontend Optimization

```bash
# Enable gzip compression
npm run build -- --minify

# Analyze bundle size
npm run build -- --analyze

# Lazy load routes
# Already implemented in App.tsx with React.lazy()
```

### 6.3 CDN Configuration

```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache HTML for 1 hour
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}

# Don't cache API calls
location /api/ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
}
```

---

## Part 7: Security Hardening

### 7.1 CORS Configuration

```yaml
cors:
  allowed-origins: https://yourdomain.com,https://www.yourdomain.com
  allowed-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
  allowed-headers: Content-Type,Authorization
  max-age: 3600
```

### 7.2 Security Headers

```yaml
security:
  headers:
    content-security-policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    x-content-type-options: nosniff
    x-frame-options: DENY
    x-xss-protection: "1; mode=block"
    strict-transport-security: "max-age=31536000; includeSubDomains"
```

### 7.3 Rate Limiting

```yaml
rate-limiting:
  enabled: true
  requests-per-minute: 100
  requests-per-hour: 5000
```

---

## Part 8: Backup & Disaster Recovery

### 8.1 Database Backups

```bash
# PostgreSQL backup
pg_dump -U postgres fooddelivery > backup-$(date +%Y%m%d).sql

# Automated daily backup
0 2 * * * pg_dump -U postgres fooddelivery | gzip > /backups/backup-$(date +\%Y\%m\%d).sql.gz
```

### 8.2 Redis Backups

```bash
# Redis backup
redis-cli BGSAVE

# Verify backup
redis-cli LASTSAVE
```

### 8.3 Restore from Backup

```bash
# PostgreSQL restore
psql -U postgres fooddelivery < backup-20250105.sql

# Redis restore
redis-cli SHUTDOWN
cp dump.rdb.backup dump.rdb
redis-server
```

---

## Part 9: CI/CD Pipeline

### 9.1 GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Build backend
        run: |
          cd backend
          mvn clean package -DskipTests
      
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

### 9.2 GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - test
  - deploy

build-backend:
  stage: build
  script:
    - cd backend
    - mvn clean package -DskipTests

build-frontend:
  stage: build
  script:
    - cd frontend
    - npm install
    - npm run build

deploy-production:
  stage: deploy
  script:
    - echo "Deploying to production..."
  only:
    - main
```

---

## Part 10: Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] Error tracking configured

### Deployment
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Database migrations applied
- [ ] Redis cache initialized
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] SSL/TLS working

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user functionality
- [ ] Test critical workflows
- [ ] Monitor database performance
- [ ] Check Redis memory usage
- [ ] Review logs for errors
- [ ] Notify stakeholders

---

## Troubleshooting

### Backend Issues

**Port already in use**
```bash
lsof -i :8080
kill -9 <PID>
```

**Database connection failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d fooddelivery
```

**Redis connection failed**
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

### Frontend Issues

**Build fails**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**API calls failing**
```bash
# Check CORS configuration
# Check API base URL in .env.production
# Check network tab in browser DevTools
```

---

## Support & Resources

- **Backend Documentation**: See BACKEND_REFACTORING_GUIDE.md
- **Frontend Documentation**: See FRONTEND_QUICK_START.md
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Last Updated**: December 5, 2025  
**Status**: Production Ready  
**Version**: 1.0.0
