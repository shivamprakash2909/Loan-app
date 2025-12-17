# Docker Deployment Guide for AWS

This guide explains how to deploy the backend application to AWS using Docker.

## Prerequisites

- Docker installed on your machine
- AWS account with ECS/EC2 access
- AWS CLI configured (for ECS deployment)
- Docker Hub account (or AWS ECR) for storing images

## Local Development with Docker Compose

### 1. Create Environment File

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=loan_app
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 2. Run with Docker Compose

```bash
cd backend
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and start the backend container
- Automatically run the seed script on startup
- Make the API available at `http://localhost:3000`

### 3. View Logs

```bash
docker-compose logs -f backend
```

### 4. Stop Services

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Building Docker Image

### Build the image:

```bash
cd backend
docker build -t loan-app-backend:latest .
```

### Test the image locally:

```bash
docker run -p 3000:3000 \
  -e DB_HOST=your_db_host \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_NAME=your_db_name \
  -e DB_PORT=5432 \
  loan-app-backend:latest
```

## AWS Deployment Options

### Option 1: AWS ECS (Elastic Container Service)

#### Step 1: Push Image to ECR (Elastic Container Registry)

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name loan-app-backend --region us-east-1

# Tag your image
docker tag loan-app-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/loan-app-backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/loan-app-backend:latest
```

#### Step 2: Create ECS Task Definition

Create a `task-definition.json`:

```json
{
  "family": "loan-app-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "loan-app-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/loan-app-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:loan-app/db-host"
        },
        {
          "name": "DB_USER",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:loan-app/db-user"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:loan-app/db-password"
        },
        {
          "name": "DB_NAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:loan-app/db-name"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/loan-app-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:3000/api/customers', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\" || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 40
      }
    }
  ]
}
```

#### Step 3: Register Task Definition

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### Step 4: Create ECS Service

```bash
aws ecs create-service \
  --cluster your-cluster-name \
  --service-name loan-app-backend \
  --task-definition loan-app-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Option 2: AWS EC2 with Docker

#### Step 1: Launch EC2 Instance

- Choose Amazon Linux 2 or Ubuntu
- Security Group: Allow port 3000 (and 22 for SSH)

#### Step 2: Install Docker on EC2

```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# For Ubuntu
sudo apt-get update
sudo apt-get install docker.io -y
sudo systemctl start docker
sudo usermod -aG docker $USER
```

#### Step 3: Set Up RDS Database

- Create PostgreSQL RDS instance
- Note the endpoint, username, password

#### Step 4: Deploy Application

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Pull and run your image
docker run -d \
  --name loan-app-backend \
  -p 3000:3000 \
  -e DB_HOST=your-rds-endpoint.region.rds.amazonaws.com \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_NAME=your_db_name \
  -e DB_PORT=5432 \
  --restart unless-stopped \
  loan-app-backend:latest
```

## Environment Variables

Required environment variables:

- `DB_HOST`: Database host (e.g., RDS endpoint or container name)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)

## Seed Script Behavior

The Dockerfile includes a startup script that:
1. Runs the seed script (`npm run seed`)
2. If seed fails (e.g., database not ready), it continues anyway
3. Starts the server

This ensures your database is populated with sample data on first deployment.

## Health Checks

The Dockerfile includes a health check that:
- Checks `/api/customers` endpoint every 30 seconds
- Starts checking after 40 seconds (allowing seed to complete)
- Retries 3 times before marking as unhealthy

## Troubleshooting

### Database Connection Issues

```bash
# Check container logs
docker logs loan-app-backend

# Check if database is accessible
docker exec loan-app-backend node -e "console.log(process.env.DB_HOST)"
```

### Seed Script Not Running

The seed script runs automatically on container start. If it fails:
- Check database connection settings
- Ensure database is accessible from container
- Check logs: `docker logs loan-app-backend`

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process or use different port
docker run -p 3001:3000 ...
```

## Production Best Practices

1. **Use AWS Secrets Manager** for database credentials
2. **Enable CloudWatch Logs** for monitoring
3. **Set up Auto Scaling** for high availability
4. **Use Application Load Balancer** for traffic distribution
5. **Enable HTTPS** with SSL certificates
6. **Regular backups** of your RDS database
7. **Monitor** container health and resource usage

## Updating the Application

```bash
# Rebuild image
docker build -t loan-app-backend:latest .

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/loan-app-backend:latest

# Update ECS service (forces new deployment)
aws ecs update-service --cluster your-cluster --service loan-app-backend --force-new-deployment
```

