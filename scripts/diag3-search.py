"""Check exact API URL baked into web build + test complete browser simulation."""
import os
import paramiko, json, re

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd, timeout=30):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode().strip()

# Find exact NEXT_PUBLIC_API_URL baked in
print("=== 1. Exact API URL in web build ===")
url_search = run(
    "docker exec tayyibt-web-1 grep -r 'sslip\\|NEXT_PUBLIC\\|api/v1' "
    "/app/.next/static/chunks/ 2>/dev/null | grep -o '\"[^\"]*api/v1[^\"]*\"' | head -5"
)
print(f"  {url_search if url_search else 'Not found directly'}")

# Also check server chunks
url_server = run(
    "docker exec tayyibt-web-1 grep -r 'sslip\\|api.v1' "
    "/app/.next/server/ 2>/dev/null | grep -o '\"[^\"]*sslip[^\"]*\"' | head -3"
)
print(f"  Server: {url_server if url_server else 'Not found'}")

# Check what environment the web container sees
print("\n=== 2. Web container env ===")
env_out = run("docker exec tayyibt-web-1 env | grep -E 'NEXT_PUBLIC|API_URL|PORT|NODE'")
print(env_out)

# Check the actual api-client.ts content in the build context
print("\n=== 3. api-client.ts on VPS ===")
print(run("cat /opt/tayyibt/web/src/lib/api-client.ts 2>/dev/null"))

# Full browser flow simulation with correct URL
print("\n=== 4. Full browser flow simulation ===")

# a) Login
login = json.loads(run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-H 'Origin: https://145-14-158-100.sslip.io' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}'"
))
token = login.get("data", {}).get("accessToken", "")
print(f"  a) Login: {'OK' if token else 'FAILED'}")

# b) Search request (exact what browser sends)
if token:
    raw = run(
        f"curl -sv 'https://145-14-158-100.sslip.io/api/v1/search?q=ahmed&category=users&limit=20' "
        f"-H 'Authorization: Bearer {token}' "
        f"-H 'Origin: https://145-14-158-100.sslip.io' "
        f"-H 'Referer: https://145-14-158-100.sslip.io/search' 2>&1 | grep -E 'HTTP|<|access-control' | head -10"
    )
    print(f"  b) Search response headers:\n{raw}")

    search_data = json.loads(run(
        f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q=ahmed&category=users&limit=20' "
        f"-H 'Authorization: Bearer {token}' "
        f"-H 'Origin: https://145-14-158-100.sslip.io'"
    ))
    inner = search_data.get("data", search_data)
    users = inner.get("users", [])
    print(f"  c) Search results: {len(users)} users")
    if users:
        u = users[0]
        print(f"  d) First user keys: {list(u.keys())}")

# Check if there's a /users/me endpoint that works
print("\n=== 5. /users/me endpoint ===")
if token:
    me = run(
        f"curl -s https://145-14-158-100.sslip.io/api/v1/users/me "
        f"-H 'Authorization: Bearer {token}'"
    )
    print(me[:200])

c.close()