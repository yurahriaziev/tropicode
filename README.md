# Tropicode

**Overview**

Tropicode is a web application designed to manage tutors and students, allowing them to schedule and conduct classes efficiently using Google Meet integration. The project consists of a Flask backend and a React frontend.

---

### Table of Contents
- [Tech Stack](#tech-stack)
- [Backend Structure](#backend-structure)
- [AWS EC2 & S3 Integration](#ec2-integration)
- [Frontend Structure](#frontend-structure)

## Tech Stack
- **Backend:** Flask, Firebase, Authlib, JWT
- **Frontend:** React, React Router
- **Database:** Firebase Firestore, AWS S3
- **Hosting:** AWS EC2

## Backend Structure
The backend, built with Flask, manages authentication, Google Meet scheduling, and user management.
#### Key Features
- JWT-based authentication
- Role-based access control
- Firebase Firestore integration
- Google Meet API for class scheduling

## AWS EC2 & S3 Integration
#### EC2 Hosting
The backend is deployed on AWS EC2 to ensure high availability and scalability.
#### S3 for static files
Students may submit a screenshot of their homework which is stored directly on S3
