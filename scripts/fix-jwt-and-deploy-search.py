"""
1. Extend JWT expiry from 15m to 7d on VPS
2. Upload updated api.ts (popular searches in English)
3. Upload updated SearchPage.tsx (auto-search)
4. Rebuild web
5. Restart backend (picks up new JWT_EXPIRES_IN)
"""
import os
import paramiko, os, time

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP     = "/opt/tayyibt"
ENV     = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
sftp = c.open_sftp()
print("Connected.\n")

def run(cmd, show=True, timeout=600):
    if show: print(f"$ {cmd[:110]}")
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


# ── 1. Fix JWT expiry in .env.production on VPS ───────────────────────────────
print("=== 1. Fix JWT expiry (15m → 7d) ===")
run(f"sed -i 's/JWT_EXPIRES_IN=15m/JWT_EXPIRES_IN=7d/' {ENV}", show=False)
run(f"grep JWT_EXPIRES_IN {ENV}")


# ── 2. Upload changed frontend files ─────────────────────────────────────────
print("\n=== 2. Upload frontend files ===")
upload("web/src/features/search/api.ts",
       f"{APP}/web/src/features/search/api.ts")
upload("web/src/features/search/components/SearchPage.tsx",
       f"{APP}/web/src/features/search/components/SearchPage.tsx")


# ── 3. Rebuild web ────────────────────────────────────────────────────────────
print("\n=== 3. Rebuild web ===")
run(f"cd {APP} && {COMPOSE} build --no-cache web 2>&1", timeout=600)

print("\n=== 4. Restart web and backend ===")
run(f"cd {APP} && {COMPOSE} up -d --no-deps web backend 2>&1")
print("Waiting 25s...")
time.sleep(25)


# ── 4. Verify ─────────────────────────────────────────────────────────────────
print("\n=== 5. Verify ===")
run('docker ps --format "table {{.Names}}\t{{.Status}}"')

# Check new placeholder in build
import subprocess
check = run(
    "docker exec tayyibt-web-1 grep -r 'ابحث بالاسم' /app/.next 2>/dev/null | wc -l",
    show=False
)
print(f"  New SearchPage in build: {'YES' if int(check.strip() or 0) > 0 else 'NO'}")

# Check popular searches in api.ts
check2 = run(
    "docker exec tayyibt-web-1 grep -r 'egypt' /app/.next/static 2>/dev/null | wc -l",
    show=False
)
print(f"  English popular searches in build: {'YES' if int(check2.strip() or 0) > 0 else 'NO'}")

# Login and test search
import json
login = json.loads(run(
    "curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"omar.khalifa@tayyibt.test\",\"password\":\"Test1234\"}'",
    show=False
))
token = login.get("data", {}).get("accessToken", "")
if token:
    print(f"\n  Login: OK (token expires in 7d now)")
    raw = run(
        f"curl -s 'https://145-14-158-100.sslip.io/api/v1/search?q=egypt&category=users&limit=20' "
        f"-H 'Authorization: Bearer {token}'",
        show=False
    )
    users = json.loads(raw).get("data", {}).get("users", [])
    print(f"  Search 'egypt': {len(users)} users — {[u['fullName'] for u in users[:4]]}")

sftp.close(); c.close()
print("\nDone.")
print("Visit: https://145-14-158-100.sslip.io/search")
print("Login: omar.khalifa@tayyibt.test / Test1234")