import os
import paramiko, json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd, timeout=30):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode().strip()

# Get the actual hash stored in DB for a user
print("=== Hash stored in DB ===")
db_hash = run(
    "docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod "
    "-t -c \"SELECT password_hash FROM users WHERE email='omar.khalifa@tayyibt.test' LIMIT 1;\""
).strip()
print(f"DB hash: [{db_hash}]")
print(f"Length: {len(db_hash)}")

# Test comparison directly in Node.js
print("\n=== bcryptjs comparison test in backend container ===")
# Write a test script to the container
test_script = f"""
const b = require('bcryptjs');
const hash = `{db_hash}`;
console.log('hash length:', hash.length);
console.log('hash:', hash.substring(0,30)+'...');
b.compare('Test1234', hash).then(r => {{
  console.log('Test1234 match:', r);
}});
b.compare('test1234', hash).then(r => {{
  console.log('test1234 match:', r);
}});
"""
run("cat > /tmp/test_bcrypt.js << 'EOF'\n" + test_script + "\nEOF")
result = run("docker exec tayyibt-backend-1 node /tmp/test_bcrypt.js 2>&1", timeout=30)
print(result)

# Also check if password_hash column has a length limit
print("\n=== Column definition ===")
print(run(
    "docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod "
    "-c \"SELECT column_name, data_type, character_maximum_length FROM information_schema.columns "
    "WHERE table_name='users' AND column_name='password_hash';\""
))

# Check backend logs for login errors
print("\n=== Backend logs during login attempt ===")
# Make a login attempt
run("curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}' > /dev/null")
print(run("docker logs tayyibt-backend-1 --tail 10 2>&1"))

c.close()