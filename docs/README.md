# Docs

Project-wide documentation for the Tayyibt platform.

## Folder Structure

```
docs/
├── api/
│   └── api-spec.md         # Full REST API reference (endpoints, request/response examples)
├── architecture/
│   └── system-design.md    # System diagrams, component interactions, data flow
├── database/
│   └── erd.md              # Entity relationship diagram and migration notes
├── ai/
│   └── matching-algorithm.md  # Detailed scoring model documentation
├── deployment/
│   └── deployment-guide.md # How to deploy to staging and production
├── onboarding/
│   └── getting-started.md  # Setup guide for new developers
└── decisions/
    └── adr-001-*.md        # Architecture Decision Records (ADRs)
```

## What Goes Here

- API documentation with request/response examples
- Architecture diagrams and system design decisions
- Database ERDs and migration history
- Deployment and infrastructure guides
- Onboarding guides for new team members
- Architecture Decision Records (ADRs) for major technical choices

## Standards

- Keep docs up to date with every feature release
- API spec must reflect actual endpoint behavior
- ADRs must be written for any major architectural decision
- Use clear English, include code examples where helpful
