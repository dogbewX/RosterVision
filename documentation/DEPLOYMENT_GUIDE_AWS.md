# Deployment Guide to AWS (App Runner + RDS)

Deploying to AWS is more complex than Render/Railway. We recommend using **AWS App Runner** for the application (easiest containerized deployment) and **Amazon RDS** for the database.

## Prerequisites
- An active AWS Account.
- AWS CLI installed (optional but helpful).
- Latest code pushed to GitHub.

## Step 1: Create the Database (Amazon RDS)
1.  Log in to the **AWS Console** and search for **RDS**.
2.  Click **Create database**.
3.  **Choose a database creation method**: Standard create.
4.  **Engine options**: PostgreSQL.
5.  **Templates**: Free tier (if eligible) or Dev/Test.
6.  **Settings**:
    - DB instance identifier: `fd-dashboard-db`
    - Master username: `postgres` (or your choice)
    - Master password: (Create a strong password and SAVE IT)
7.  **Instance configuration**: `db.t3.micro` or `t4g.micro` (Free Tier eligible).
8.  **Connectivity**:
    - **Public access**: **Yes** (Simplest for App Runner to connect without complex VPC peering, though less secure. For production, use VPC peering, but for this guide, Public is easiest).
    - **VPC security group**: Create new. Allow traffic from Anywhere (0.0.0.0/0) initially to test, then restrict to App Runner's IP if possible.
9.  Click **Create database**.
10. Wait for status to become **Available**.
11. Note the **Endpoint** (Host), **Port** (5432), **User**, and **Password**.

## Step 2: Prepare App Runner
1.  Search for **AWS App Runner** in the Console.
2.  Click **Create an App Runner service**.
3.  **Source**: Source code repository.
4.  **Connect to GitHub** and select your repository & branch (`main`).
5.  **Deployment settings**: Automatic.
6.  **Build settings** (Configure all settings here):
    - **Runtime**: Node.js 16 (or latest available LTS).
    - **Build command**: `npm install && npm run build`
    - **Start command**: `npm start`
    - **Port**: `3000`
7.  Click **Next**.

## Step 3: Configure Service (Environment Variables)
1.  **Service name**: `fd-dashboard-service`.
2.  **Environment variables**: You must add the database connection details here.
    - `DB_USER`: `postgres`
    - `DB_HOST`: (Your RDS Endpoint from Step 1)
    - `DB_NAME`: `postgres` (default) or whatever you named it.
    - `DB_PASSWORD`: (Your RDS Password)
    - `DB_PORT`: `5432`
    - `PGSSLMODE`: `require` (AWS RDS often requires SSL).
3.  Click **Next** -> **Create & deploy**.

## Step 4: Finalize
1.  Wait for deployment (can take 5-10 minutes).
2.  App Runner will provide a **Default domain** (e.g., `https://xyz.awsapprunner.com`).
3.  **Update your Mobile App**:
    - Open `mobile-app/src/services/api.js`.
    - Update `BASE_URL` to your new App Runner domain: `https://xyz.awsapprunner.com/api`.
    - Rebuild/Publish your mobile app.

## Troubleshooting
- **Database Connection Timeout**: Check your RDS **Security Group** inbound rules. Ensure it allows traffic on Port 5432.
- **SSL Errors**: Ensure `PGSSLMODE=require` is set in environment variables.
