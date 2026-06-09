import os
import paramiko, json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

print("=== Container status ===")
print(run('docker ps --format "table {{.Names}}\t{{.Status}}"'))

# Check the seeded user exists in DB
print("\n=== DB check — first seed user ===")
print(run(
    "docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod "
    "-c \"SELECT email, status, is_verified, password_hash FROM users "
    "WHERE email LIKE '%tayyibt.test' LIMIT 3;\""
))

# Try login without -f flag so we see errors
print("\n=== Login test (verbose) ===")
login_raw = run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"ahmed.alrashid@tayyibt.test\",\"password\":\"Test1234\"}'"
)
print(login_raw[:400])

# Also try with the admin account from CLAUDE.md (known working)
print("\n=== Login with admin account ===")
admin_raw = run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"admin@tayyibt.com\",\"password\":\"Admin1234\"}'"
)
print(admin_raw[:400])

# Try the login with the token
try:
    login_data = json.loads(admin_raw)
    access = (
        login_data.get("data", {}).get("accessToken")
        or login_data.get("accessToken")
        or ""
    )
    if access:
        print(f"\n=== Search tests using admin token ===")
        for query in ["ahmed", "fatima", "cairo", "egypt", "doctor", "engineer"]:
            result_raw = run(
                f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q={query}' "
                f"-H 'Authorization: Bearer {access}'"
            )
            try:
                result = json.loads(result_raw)
                users = result.get("data", {}).get("users", result.get("users", []))
                print(f"  '{query}': {len(users)} users — {[u.get('fullName') or u.get('firstName','') for u in users[:3]]}")
            except:
                print(f"  '{query}': parse error — {result_raw[:80]}")
    else:
        print("No admin token. Trying seed user login directly...")
        seed_raw = run(
            "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
            "-H 'Content-Type: application/json' "
            "-d '{\"email\":\"ahmed.alrashid@tayyibt.test\",\"password\":\"Test1234\"}'"
        )
        print(seed_raw[:300])
except Exception as e:
    print(f"Error: {e}")

c.close()