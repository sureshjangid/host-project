# Multi-Server Deployment Project

This project demonstrates a multi-server deployment process using Node.js, Express, Redis, and AWS S3. The system is composed of three backend services: **Upload Service**, **Deploy Service**, and **Request Service**.

## Architecture Overview

### 1. **Upload Service**
   - **Functionality**: Allows users to upload a GitHub repository or project code.
   - **Process**:
     1. The code or repo is uploaded to AWS S3.
     2. A unique ID is generated for the upload and pushed to Redis.
   - **Technologies**: Node.js, Express, Redis, AWS SDK

### 2. **Deploy Service**
   - **Functionality**: Retrieves the uploaded code based on the unique ID, builds the project, and re-uploads the build to AWS S3.
   - **Process**:
     1. Monitors Redis for new upload IDs.
     2. Pulls the code from AWS S3.
     3. Builds the project.
     4. Uploads the build back to S3.
   - **Endpoint**: Automatically triggered on Redis ID update.
   - **Technologies**: Node.js, Express, Redis, AWS SDK

### 3. **Request Service**
   - **Functionality**: Serves the UI for the deployed project when a user accesses the unique URL.
   - **Process**:
     1. When the user hits the unique URL, the service retrieves the built UI from S3.
     2. Renders the UI for the user.
   - **Technologies**: Node.js, Express, AWS SDK


