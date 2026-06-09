"""
Upload only changed files, then rebuild backend + web.
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
    """Upload a single file, creating remote dirs via sftp (no shell quoting issues)."""
    local = os.path.join(PROJECT, *local_rel.replace("/","\\").split("\\"))
    # Create remote directory via sftp (handles special chars)
    remote_dir = os.path.dirname(remote)
    parts = remote_dir.split("/")
    path = ""
    for part in parts:
        if not part: continue
        path = f"{path}/{part}"
        try: sftp.mkdir(path)
        except: pass  # already exists
    with open(local, "rb") as f: data = f.read()
    with sftp.open(remote, "wb") as rf: rf.write(data)
    print(f"  ✓ {os.path.basename(local)}")


# ── Upload only changed files ─────────────────────────────────────────────────
print("=== 1. Upload changed files ===")

CHANGED = [
    # Backend: search service (field names + new fields)
    ("backend/src/search/services/search.service.ts",
     f"{APP}/backend/src/search/services/search.service.ts"),
    ("backend/src/search/search.module.ts",
     f"{APP}/backend/src/search/search.module.ts"),

    # Web: SearchPage rewrite
    ("web/src/features/search/components/SearchPage.tsx",
     f"{APP}/web/src/features/search/components/SearchPage.tsx"),
]

for local_rel, remote in CHANGED:
    upload(local_rel, remote)


# ── Rebuild backend ───────────────────────────────────────────────────────────
print("\n=== 2. Rebuild backend ===")
run(f"cd {APP} && {COMPOSE} build --no-cache backend 2>&1", timeout=600)

print("\n=== 3. Restart backend ===")
run(f"cd {APP} && {COMPOSE} up -d --no-deps backend 2>&1")
time.sleep(20)
run("curl -sf https://145-14-158-100.sslip.io/api/v1/health")


# ── Rebuild web ───────────────────────────────────────────────────────────────
print("\n=== 4. Rebuild web ===")
run(f"cd {APP} && {COMPOSE} build --no-cache web 2>&1", timeout=600)

print("\n=== 5. Restart web ===")
run(f"cd {APP} && {COMPOSE} up -d --no-deps web 2>&1")
time.sleep(20)


# ── Final status ──────────────────────────────────────────────────────────────
print("\n=== 6. Final status ===")
run('docker ps --format "table {{.Names}}\t{{.Status}}"')

sftp.close(); c.close()
print("\nDone — visit https://145-14-158-100.sslip.io/search")