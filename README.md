# Google Club Unified Access System (UAS) - Central Authentication Service (CAS)

## Overview

The **Central Authentication Service (CAS)** is a key component of the Google Club Unified Access System (UAS), responsible for handling authentication through JWT (JSON Web Token) tokens and ensuring secure token-based user access across the Google Club ecosystem. By managing authentication in a centralized and efficient manner, CAS simplifies and secures user interactions with Google Club services.

## Core Responsibilities

### Authentication
- **Token Generation**: Provides a secure JWT token for user authentication.
- **Token Verification**: Verifies JWT tokens to ensure users are authenticated and authorized to access resources.
- **Cached Authorities**: Quickly retrieves and verifies user authorities for low-latency authentication and minimizes database load through caching.

### Cache Management
- **Authority Caching**: Stores user authorities to optimize performance and reduce database queries.
- **Cache Control**: Allows for selective clearing of cached data for individual accounts or all accounts, providing flexible cache management.

## Technologies

The CAS is built with **Express.js**, a lightweight and efficient framework ideal for handling high-performance authentication tasks in a centralized system. By leveraging this technology, CAS offers responsive authentication and supports seamless integration with other UAS components.

## API Endpoints

### General Purpose
- `GET /health-check`: Performs a health check for the CAS service, ensuring it is running and responsive.

### Cache Management
- `GET /get-all-accounts-ids-in-cache`: Retrieves all cached account IDs.
- `GET /get-account-cached-authorities`: Retrieves cached authorities for a specific account.
- `DELETE /clear-all-accounts-cache`: Clears the cache for all accounts, refreshing stored authorities.
- `DELETE /clear-account-cache`: Clears the cache for a specific account, allowing updated authorities to be retrieved on the next access.

### Authentication Management
- `POST /generate-jwt-token`: Generates a JWT token for user login.
- `GET /get-authorities`: Retrieves the authorities assigned to an account.
- `GET /verify-token`: Verifies the validity of a JWT token, confirming user authentication status.

## System Communication

The **CAS** communicates seamlessly with other components within the UAS, particularly the **Identity Control Service (ICS)** and the **Accounts Database**. This integration supports real-time updates, allowing CAS to serve as the authentication backbone for all Google Club services and ensuring a secure, scalable environment.

## How CAS Fits into the Google Club Unified Access System

CAS is an integral part of the UAS architecture:
- Provides a centralized solution for authentication across the Google Club ecosystem.
- Enhances security and performance through JWT tokens and caching mechanisms.
- Reduces redundant authentication logic across applications, allowing developers to focus on core features.

## Current Maintainer

- **Wassim Rached** is responsible for overseeing the development and management of the CAS component within the Google Club UAS.

---

The **Central Authentication Service (CAS)** offers a secure and scalable solution for authentication across Google Club applications, facilitating efficient and consistent access management within the UAS ecosystem.
