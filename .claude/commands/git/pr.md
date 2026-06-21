---
description: Create a GitHub pull request for the current branch. Usage: /git/pr [target-branch]
argument-hint: [target-branch — defaults to main]
---

## Variables
- TARGET_BRANCH: `$ARGUMENTS` (defaults to `main`)
- SOURCE_BRANCH: current branch (`git branch --show-current`)
- GH_TOKEN: read from environment (`$GH_TOKEN`) — set in `.env.production` or shell
- REPO: `mohamednagdy776-arch/test`

## Workflow

1. Confirm the working tree is clean (`git status`).
2. Push the branch if not already on remote:
   ```bash
   git push -u origin $SOURCE_BRANCH
   ```
3. Create the PR:
   ```bash
   gh pr create \
     --repo mohamednagdy776-arch/test \
     --base ${TARGET_BRANCH:-main} \
     --head $SOURCE_BRANCH \
     --title "<Conventional commit title>" \
     --body "$(cat <<'EOF'
   ## Summary
   - <bullet 1>
   - <bullet 2>

   ## Test plan
   - [ ] <test step>

   🤖 Generated with Claude Code
   EOF
   )"
   ```
4. Return the PR URL.
