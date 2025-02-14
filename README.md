# Tropicode

**Overview**

Tropicode is a web application designed to manage tutors and students, allowing them to schedule and conduct classes efficiently using Google Meet integration. The project consists of a Flask backend and a React frontend.

---

### Table of Contents
- [Tech Stack](#tech-stack)
- [Backend Structure](#backend-structure)
- [AWS Integration](#aws-integration)
- [Authentication](#authentication)
- [Application Flowchart](#application-flowchart)
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

## AWS Integration
#### EC2 Hosting
The backend is deployed on AWS EC2 to ensure high availability and scalability.
#### S3 for static files
Students may submit a screenshot of their homework which is stored directly on S3

## Authentication
The application uses **JWT-based authentication** for secure access. Users log in using a unique user code, and a token is issued upon successful login.
### **Login Process**
1. User enters their **user code**.
2. The backend verifies the code against the Firebase Firestore database.
3. If valid, a **JWT (JSON Web Token)** is generated and returned.
4. The token is included in all API requests for authentication.

### **Role-Based Access Control (RBAC)**
Each user has a specific role:
- **Admin**: Full access, can create and manage tutors and students.
- **Tutor**: Can manage students and schedule classes.
- **Student**: Can view upcoming classes and join meetings.

### **Token Expiry & Refresh**
- **Access tokens** are valid for **1 hour**.
- Tutors using Google Meet must **refresh their token** when expired.
- If a token expires, users must re-authenticate.

## Application Flowchart
&nbsp; [Tutor Flow](#tutor-flow)  &nbsp; [Student Flow](#student-flow)
### General flow

### Tutor Flow

### Student Flow

## Frontend Structure
#### Key Components
- ` Login.js ` - Login students and tutors
- ` StudentDash.js ` - Student dashboard
- ` TutorDash.js ` - Tutor dashboard
- ` AdminDash.js ` - Admin dashboard
