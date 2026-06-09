import os
import paramiko, os, time, json

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP     = "/opt/tayyibt"
ENV     = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
sftp = c.open_sftp()
print("Connected.")

def run(cmd, show=True, timeout=600):
    if show: print(f"$ {cmd[:100]}")
    _, o, e = c.exec_command(cmd, get_pty=True, timeout=timeout)
    out = ""
    for line in o:
        l = line.rstrip()
        if l: print(f"  {l}"); out += l + "\n"
    o.channel.recv_exit_status()
    return out

def upload(local_rel, remote):
    local = os.path.join(PROJECT, *local_rel.replace("/","\\").split("\\"))
    remote_dir = os.path.dirname(remote)
    parts = remote_dir.split("/")
    path = ""
    for part in parts:
        if not part: continue
        path = f"{path}/{part}"
        try: sftp.mkdir(path)
        except: pass
    with open(local, "rb") as f: data = f.read()
    with sftp.open(remote, "wb") as rf: rf.write(data)
    print(f"  ✓ {os.path.basename(local)}")

print("\n=== 1. Upload fixed backend files ===")
upload("backend/src/auth/services/auth.service.ts",
       f"{APP}/backend/src/auth/services/auth.service.ts")
upload("backend/src/search/services/search.service.ts",
       f"{APP}/backend/src/search/services/search.service.ts")

print("\n=== 2. Rebuild & restart backend ===")
run(f"cd {APP} && {COMPOSE} build --no-cache backend 2>&1", timeout=600)
run(f"cd {APP} && {COMPOSE} up -d --no-deps backend 2>&1")
print("Waiting 20s...")
time.sleep(20)

print("\n=== 3. Verify ===")
run('docker ps --format "table {{.Names}}\t{{.Status}}"')

# Test JWT TTL
login = json.loads(run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}'",
    show=False
))
token = login.get("data", {}).get("accessToken", "")
if token:
    import base64
    payload = token.split('.')[1]
    payload += '=' * ((-len(payload)) % 4)
    decoded = json.loads(base64.urlsafe_b64decode(payload))
    ttl = decoded['exp'] - decoded['iat']
    print(f"\n  JWT TTL: {ttl}s = {ttl/3600:.1f}h = {ttl/86400:.1f}d")

    print("\n=== 4. Search tests ===")
    for q, cat in [("egypt","users"),("conservative","users"),("moderate","users"),("ahmed","users"),("sunni","users")]:
        raw = run(
            f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q={q}&category={cat}&limit=20' "
            f"-H 'Authorization: Bearer {token}'",
            show=False
        )
        users = json.loads(raw).get("data", {}).get("users", [])
        names = [u.get("fullName","?") for u in users[:3]]
        print(f"  '{q}': {len(users)} users — {names}")

sftp.close(); c.close()
print("\nDone.")