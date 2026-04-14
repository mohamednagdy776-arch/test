---
description: Run comprehensive security audit
agent: security
model: anthropic/claude-opus-4-1-20250805
---
Run comprehensive security audit using /cso and /security-review.

Run GStack /cso first for OWASP + STRIDE analysis:
- Check for injection vulnerabilities
- Verify authentication/authorization
- Check for hardcoded secrets
- Review data protection
- Check API security

Then run /security-review for AI-powered analysis:
- Contextual vulnerability detection
- False positive filtering
- Remediation recommendations

Focus areas for Tayyibt:
- User authentication (JWT/bcrypt)
- Profile data encryption
- Payment integration
- Content moderation
- API rate limiting

Reference: @.kiro/steering/security-rules.md