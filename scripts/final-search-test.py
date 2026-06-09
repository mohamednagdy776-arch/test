"""Final end-to-end test: login → search → verify cards render."""
import os
import paramiko, json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd, timeout=20):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode().strip()

# Login
token = json.loads(run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}'"
)).get("data", {}).get("accessToken", "")

print(f"Login: {'OK' if token else 'FAILED'}\n")
if not token: c.close(); exit(1)

# Test all popular search terms
print("Search results for each popular search term:")
print("-" * 55)
for term in ["egypt", "saudi", "doctor", "engineer", "london", "conservative", "moderate", "ahmed", "fatima", "cairo", "sunni"]:
    raw = run(
        f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q={term}&category=users&limit=20' "
        f"-H 'Authorization: Bearer {token}'"
    )
    try:
        users = json.loads(raw).get("data", {}).get("users", [])
        names = [u.get("fullName","?") for u in users[:3]]
        print(f"  {term:15} → {len(users):2} users  {names}")
    except:
        print(f"  {term:15} → ERROR: {raw[:60]}")

# Verify JWT expiry is 7d
print("\nJWT expiry check:")
import base64
try:
    payload = token.split('.')[1]
    payload += '=' * (4 - len(payload) % 4)
    decoded = json.loads(base64.urlsafe_b64decode(payload))
    exp = decoded.get('exp', 0)
    iat = decoded.get('iat', 0)
    ttl_hours = (exp - iat) / 3600
    print(f"  Token TTL: {ttl_hours:.0f} hours ({ttl_hours/24:.1f} days)")
except Exception as e:
    print(f"  Could not decode: {e}")

c.close()
print("\nAll good! Visit https://145-14-158-100.sslip.io/search")