# Security Policy

Sort Playground is a static web application with no backend, no authentication, and no database.

Even so, security reports are welcome.

## Supported Versions

The `main` branch is the supported version.

Security fixes should target the current codebase unless maintainers say otherwise.

## Reporting a Vulnerability

Please do not open a public issue for a security vulnerability.

Report security concerns privately through GitHub:

https://github.com/T-1234567890/sort-playground/security/advisories/new

If GitHub Security Advisories are unavailable, contact the maintainer through:

https://1234567890.dev

## What to Include

Please include:

- a clear description of the issue
- steps to reproduce
- affected route or feature
- browser and device details if relevant
- screenshots or proof of concept if safe to share

## Scope

In scope:

- cross-site scripting risks
- unsafe markdown or HTML rendering
- unsafe export or embed behavior
- dependency vulnerabilities that affect the shipped app
- issues that could mislead users or expose unexpected data

Out of scope:

- vulnerabilities requiring control of the user's local machine
- reports only about missing security headers on local dev servers
- social engineering
- denial-of-service issues that only affect local development
- issues in third-party platforms such as GitHub Pages or Cloudflare Pages

## Response Expectations

Maintainers will try to:

- acknowledge valid reports as soon as practical
- investigate the impact
- ship a fix when needed
- credit reporters when appropriate

This is a small open-source project, so response times may vary.

## Security Notes

Sort Playground should remain:

- static
- dependency-light
- free of authentication
- free of server-side data storage

Security-related changes should preserve that model unless there is a strong reason to change it.
