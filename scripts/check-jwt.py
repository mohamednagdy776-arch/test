import os
import paramiko, json, base64

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

print("=== JWT_EXPIRES_IN in env ===")
print(run(f"grep JWT_EXPIRES_IN /opt/tayyibt/.env.production"))

print("\n=== Backend env vars ===")
print(run("docker exec tayyibt-backend-1 env | grep JWT"))

print("\n=== Decode fresh token ===")
login = json.loads(run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}'"
))
token = login.get("data", {}).get("accessToken", "")
if token:
    payload = token.split('.')[1]
    payload += '=' * ((-len(payload)) % 4)  # correct padding
    decoded = json.loads(base64.urlsafe_b64decode(payload))
    exp = decoded.get('exp', 0)
    iat = decoded.get('iat', 0)
    ttl_sec = exp - iat
    print(f"  iat={iat}, exp={exp}, TTL={ttl_sec}s = {ttl_sec/3600:.1f}h = {ttl_sec/86400:.1f}d")

c.close()