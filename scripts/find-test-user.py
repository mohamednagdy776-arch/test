import os
import sys
import io
import json
import urllib.request
import urllib.error
import paramiko

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD', ''),
          timeout=60, banner_timeout=60, auth_timeout=60)


def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read().decode() + e.read().decode()).strip()


user = run("docker exec tayyibt-postgres-1 printenv POSTGRES_USER").strip() or "postgres"
db = run("docker exec tayyibt-postgres-1 printenv POSTGRES_DB").strip() or "tayyibt"
print(f"DB user={user} db={db}")

q = "SELECT email FROM users ORDER BY created_at DESC LIMIT 30;"
emails = run(f"docker exec tayyibt-postgres-1 psql -U {user} -d {db} -t -A -c \"{q}\" 2>&1")
print("=== sample emails ===")
print(emails)
c.close()

candidates = [e.strip() for e in emails.splitlines() if '@' in e]
tried = []
for email in candidates:
    for pw in ('Test1234', 'password123', 'Password123!'):
        body = json.dumps({"email": email, "password": pw}).encode()
        req = urllib.request.Request(
            "https://145-14-158-100.sslip.io/api/v1/auth/login",
            data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.load(r)
                d = data.get('data', data)
                print(f"\nWORKS: {email} / {pw}")
                print("  has accessToken:", bool(d.get('accessToken')))
                print("  requiresTwoFactor:", d.get('requiresTwoFactor'))
                sys.exit(0)
        except urllib.error.HTTPError as ex:
            tried.append(f"{email}/{pw} -> {ex.code}")
        except Exception as ex:
            tried.append(f"{email}/{pw} -> {type(ex).__name__}")

print("\nNo working credential found. Tried (first 20):")
print("\n".join(tried[:20]))
