"""Deep search diagnostic — check build content, API URL, and simulate browser flow."""
import os
import paramiko, json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd, timeout=30):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode().strip()

# 1. Check if NEW SearchPage is in the build (Arabic placeholder is not minified)
print("=== 1. New vs old SearchPage in web build ===")
new_ph = run("docker exec tayyibt-web-1 grep -r 'ابحث بالاسم' /app/.next 2>/dev/null | wc -l")
old_ph = run("docker exec tayyibt-web-1 grep -r 'ابحث في المجتمع' /app/.next 2>/dev/null | wc -l")
print(f"  New placeholder 'ابحث بالاسم': {new_ph} matches")
print(f"  Old placeholder 'ابحث في المجتمع': {old_ph} matches")

# 2. What NEXT_PUBLIC_API_URL is baked in?
print("\n=== 2. NEXT_PUBLIC_API_URL in web build ===")
url_check = run(
    "docker exec tayyibt-web-1 grep -r 'NEXT_PUBLIC_API_URL\\|145-14-158-100.sslip\\|api/v1' "
    "/app/.next/static/ 2>/dev/null | head -3"
)
print(f"  {url_check[:300] if url_check else 'NOT FOUND'}")

# 3. Get a fresh token and test the exact frontend URL
print("\n=== 3. Login for fresh token ===")
login = json.loads(run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}'"
))
token = login.get("data", {}).get("accessToken", "")
print(f"  Token: {'OK (' + token[:20] + '...)' if token else 'FAILED'}")

# 4. Simulate exactly what the browser SearchPage does
print("\n=== 4. Simulated browser search calls ===")
if token:
    # searchAll with q=ahmed, category=users, limit=20
    raw = run(
        f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q=ahmed&category=users&limit=20' "
        f"-H 'Authorization: Bearer {token}' "
        f"-H 'Origin: https://145-14-158-100.sslip.io'"
    )
    try:
        data = json.loads(raw)
        inner = data.get("data", data)
        users = inner.get("users", [])
        print(f"  search?q=ahmed&category=users&limit=20 → {len(users)} users")
        if users:
            u = users[0]
            print(f"  First user: {u}")
    except Exception as e:
        print(f"  Parse error: {e} — raw: {raw[:200]}")

    # searchSuggestions: autocomplete call
    raw2 = run(
        f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search/autocomplete?q=ahmed' "
        f"-H 'Authorization: Bearer {token}'"
    )
    try:
        data2 = json.loads(raw2)
        inner2 = data2.get("data", data2)
        print(f"  autocomplete?q=ahmed → users: {len(inner2.get('users', []))}")
    except Exception as e:
        print(f"  Autocomplete error: {e} — {raw2[:100]}")

# 5. Check if the web is serving the page correctly
print("\n=== 5. /search page HTML snippet ===")
html = run(f"curl -s https://145-14-158-100.sslip.io/search | head -c 500")
print(html[:300])

# 6. Web build time
print("\n=== 6. Web build timestamp ===")
print(run("docker inspect tayyibt-web-1 --format '{{.Created}}'"))
print(run("docker inspect tayyibt-backend-1 --format '{{.Created}}'"))

c.close()