"""Full search diagnostic: API response + web container state + JS errors."""
import os
import paramiko, json

c = paramiko.SSHClient()
# Security fix: Use RejectPolicy and load system host keys to prevent MitM
c.load_system_host_keys()
c.set_missing_host_key_policy(paramiko.RejectPolicy())
c.connect('145.14-158-100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd, timeout=30):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode().strip()

# 1. Login
print("=== 1. Login ===")
# Security fix: Load test credentials from environment variables instead of hardcoding.
# This prevents secrets from being exposed in source code.
TEST_EMAIL = os.environ.get('TEST_USER_EMAIL', 'omar.khalifa@tayyibt.test')
TEST_PASSWORD = os.environ.get('TEST_USER_PASSWORD')
if not TEST_PASSWORD:
    raise ValueError('TEST_USER_PASSWORD environment variable is required')
login_payload = json.dumps({'email': TEST_EMAIL, 'password': TEST_PASSWORD})
login = json.loads(run(
    f"curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    f"-H 'Content-Type: application/json' "
    f"-d '{login_payload}'"
))
token = login.get("data", {}).get("accessToken", "")
print(f"Login: {'OK' if token else 'FAILED'} — {'' if token else login}")

if not token:
    c.close(); exit(1)

# 2. Exact API call the frontend makes
print("\n=== 2. Search API (exact frontend call) ===")
for q, cat in [("ahmed", "users"), ("egypt", "users"), ("engineer", "users")]:
    raw = run(
        f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q={q}&category={cat}&limit=20' "
        f"-H 'Authorization: Bearer {token}'"
    )
    try:
        data = json.loads(raw)
        inner = data.get("data", data)
        users = inner.get("users", [])
        if users:
            u = users[0]
            print(f"  '{q}': {len(users)} users — first: {u.get('fullName')} | "
                  f"avatarUrl={'✓' if u.get('avatarUrl') is not None else '✗'} | "
                  f"lifestyle={u.get('lifestyle')} | education={u.get('education')}")
        else:
            print(f"  '{q}': 0 users — raw: {raw[:120]}")
    except Exception as e:
        print(f"  parse error: {e} — {raw[:80]}")

# 3. Check web container has new SearchPage
print("\n=== 3. Web container — SearchPage in build ===")
# The standalone build compiles TSX into JS chunks — search for 'runSearch' which is unique to new code
result = run("docker exec tayyibt-web-1 grep -r 'runSearch\\|hasSearched' /app/.next/static/ 2>/dev/null | wc -l")
print(f"  'runSearch'/'hasSearched' occurrences in .next/static: {result}")
# Also check if old broken useQuery pattern is present
old = run("docker exec tayyibt-web-1 grep -r 'performSearch' /app/.next/static/ 2>/dev/null | wc -l")
print(f"  Old 'performSearch' occurrences: {old}")

# 4. Web app response (does it serve HTML?)
print("\n=== 4. Web response for /search ===")
resp = run(f"curl -s -o /dev/null -w '%{{http_code}}' https://145-14-158-100.sslip.io/search")
print(f"  /search HTTP status: {resp}")

# 5. Backend logs for any search errors
print("\n=== 5. Backend logs (last 15) ===")
# Trigger a search first
run(f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q=ahmed&category=users' "
    f"-H 'Authorization: Bearer {token}' > /dev/null")
print(run("docker logs tayyibt-backend-1 --tail 15 2>&1"))

# 6. Web container logs
print("\n=== 6. Web container logs (last 10) ===")
print(run("docker logs tayyibt-web-1 --tail 10 2>&1"))

# 7. Check CORS headers
print("\n=== 7. CORS headers on search API ===")
print(run(
    f"curl -s -I -X OPTIONS https://145-14-158-100.sslip.io/api/v1/search "
    f"-H 'Origin: https://145-14-158-100.sslip.io' "
    f"-H 'Access-Control-Request-Method: GET' 2>&1 | grep -i -E 'access-control|cors|http'"
))

# 8. Check NEXT_PUBLIC_API_URL baked into web build
print("\n=== 8. NEXT_PUBLIC_API_URL in web build ===")
result = run(
    "docker exec tayyibt-web-1 grep -r '145-14-158-100' /app/.next/static/ 2>/dev/null | head -2"
)
print(f"  {result[:200] if result else 'NOT FOUND — API URL may not be baked in!'}")

c.close()

