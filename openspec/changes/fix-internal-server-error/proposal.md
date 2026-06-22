# Fix Internal Server Error

## Problem
Gateway returns generic 500 "Internal server error" without details when TCP microservices are unreachable or when validation fails.

## Solution
1. Add try/catch to all TCP proxy calls with detailed error logging
2. Add global exception filter to log full error stack
3. Handle TCP connection errors gracefully

## Scope
- backend-gateway: Add error handling to controllers + global filter
