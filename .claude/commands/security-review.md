# Security Review Command

## Purpose
Perform a comprehensive security review of all pending code changes in the repository.

## When to Use
- Before merging any PR to main
- After implementing new features
- When adding new dependencies
- After any backend API changes

## How It Works
This command runs the Claude Code security review which:
1. Analyzes all changed files since the last commit
2. Identifies potential security vulnerabilities
3. Provides detailed findings with severity ratings
4. Suggests remediation steps
5. Comments findings directly on PRs (when run as GitHub Action)

## Tayyibt-Specific Focus Areas

### Authentication & Authorization
- JWT token handling and validation
- Password hashing (bcrypt)
- Session management
- Role-based access control
- API authentication middleware

### Data Protection
- User profile data encryption
- PII (Personally Identifiable Information) handling
- Database query parameterization
- Sensitive data in logs

### API Security
- Input validation and sanitization
- Rate limiting implementation
- CORS configuration
- API endpoint authorization
- File upload security

### Frontend Security
- XSS prevention in React components
- Content Security Policy
- Secure state management
- Form validation

### Islamic Content Moderation
- Content filtering endpoints
- User report handling
- Privacy-preserving matching

## Usage

```bash
# In Claude Code - review all pending changes
/security-review

# Or use the GitHub Action (automatic on PRs)
# See .github/workflows/security-review.yml
```

## Example Output
The security review will output:
- Number of findings by severity (Critical, High, Medium, Low)
- Specific vulnerability descriptions
- File locations and line numbers
- Remediation recommendations

## Post-Review Actions
1. Review all Critical/High findings
2. Fix identified issues
3. Re-run security review
4. Only merge when no critical issues remain

## Integration with PR Agent
The PR Agent will also run security checks as part of `/review`.
For maximum coverage, use both:
- `/security-review` - Deep security analysis
- `@CodiumAI-Agent /review` - General code quality

---

*This command is part of the Claude Code Security Review tool*
*See: https://github.com/anthropics/claude-code-security-review*