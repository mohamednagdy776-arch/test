"""
Fix: the $2a$ bcrypt hash was shell-interpolated when passed on cmd line.
Solution: write SQL via SFTP, execute with psql -f (no shell interpolation).
"""
import os
import paramiko, json, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
sftp = c.open_sftp()

def run(cmd, timeout=60):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode().strip()

# Generate hash inside the backend container, save to a file (avoids shell var expansion)
print("Generating hash...")
run("docker exec tayyibt-backend-1 node -e "
    "\"require('bcryptjs').hash('Test1234',12).then(h=>{require('fs').writeFileSync('/tmp/hash.txt',h)})\"")
time.sleep(3)

# Read the hash from the file (avoids shell expansion of $)
hash_val = run("docker exec tayyibt-backend-1 cat /tmp/hash.txt").strip()
print(f"Hash ({len(hash_val)} chars): {hash_val[:20]}...")

if len(hash_val) < 55:
    print("ERROR: hash too short, generation failed")
    c.close()
    exit(1)

# Write SQL to a file via SFTP — never touch the shell with $ chars
sql = f"""UPDATE users
SET password_hash = '{hash_val}'
WHERE email LIKE '%@tayyibt.test'
   OR email IN ('admin@tayyibt.com','user1@tayyibt.com','user2@tayyibt.com');
"""
with sftp.open("/tmp/update_passwords.sql", "w") as f:
    f.write(sql)
print("SQL file written via SFTP.")

# Copy the SQL file into the postgres container and execute it
run("docker cp /tmp/update_passwords.sql tayyibt-postgres-1:/tmp/update_passwords.sql")
result = run(
    "docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod "
    "-f /tmp/update_passwords.sql"
)
print(f"Update result: {result}")

# Verify hash is now correct in DB
stored = run(
    "docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod "
    "-t -c \"SELECT password_hash FROM users WHERE email='omar.khalifa@tayyibt.test';\""
).strip()
print(f"Stored hash ({len(stored)} chars): {stored[:25]}...")

if len(stored) < 55:
    print("ERROR: stored hash still wrong")
    c.close()
    exit(1)

print("\n=== Testing login ===")
time.sleep(1)
login_raw = run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}'"
)
print(f"Login: {login_raw[:200]}")

try:
    login_data = json.loads(login_raw)
    access = (
        login_data.get("data", {}).get("accessToken")
        or login_data.get("accessToken", "")
    )
    if not access:
        print("Login failed. Keys:", list(login_data.keys()))
        c.close()
        exit(1)

    print(f"LOGIN SUCCESS! Token: {access[:30]}...\n")
    print("=== Search tests ===")
    for query in ["ahmed", "fatima", "cairo", "egypt", "doctor", "engineer", "sunni", "saudi", "london"]:
        result_raw = run(
            f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q={query}' "
            f"-H 'Authorization: Bearer {access}'"
        )
        try:
            result = json.loads(result_raw)
            users = result.get("data", {}).get("users", result.get("users", []))
            names = [
                u.get("fullName") or f"{u.get('firstName','')} {u.get('lastName','')}".strip()
                for u in users[:4]
            ]
            print(f"  '{query}': {len(users)} users — {names}")
        except Exception as e:
            print(f"  '{query}': error — {result_raw[:80]}")

except Exception as e:
    print(f"Error: {e}")

sftp.close()
c.close()