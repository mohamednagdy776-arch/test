"""
Upload changed backend source files and rebuild the backend container.
Only uploads src/ — avoids re-sending node_modules.
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

def upload_file(local, remote):
    run(f"mkdir -p {os.path.dirname(remote)}", show=False)
    with open(local, "rb") as f: data = f.read()
    with sftp.open(remote, "wb") as rf: rf.write(data)

def upload_dir(local_dir, remote_dir):
    for root, dirs, files in os.walk(local_dir):
        dirs[:] = [d for d in dirs if d not in {"node_modules", "dist", ".next", "__pycache__"}]
        for fname in files:
            if fname.endswith((".js", ".js.map", ".d.ts")): continue
            local  = os.path.join(root, fname)
            rel    = os.path.relpath(local, local_dir).replace("\\", "/")
            remote = f"{remote_dir}/{rel}"
            upload_file(local, remote)

print("=== 1. Upload backend/src ===")
upload_dir(os.path.join(PROJECT, "backend", "src"), f"{APP}/backend/src")
print(f"  Uploaded backend/src")

# Also upload package.json in case deps changed
upload_file(os.path.join(PROJECT, "backend", "package.json"), f"{APP}/backend/package.json")

print("\n=== 2. Rebuild backend ===")
run(f"cd {APP} && {COMPOSE} build --no-cache backend 2>&1", timeout=600)

print("\n=== 3. Restart backend ===")
run(f"cd {APP} && {COMPOSE} up -d --no-deps backend 2>&1")
print("Waiting 20s for backend to start...")
time.sleep(20)

print("\n=== 4. Health check ===")
run("curl -sf https://145-14-158-100.sslip.io/api/v1/health 2>&1")

print("\n=== 5. Quick search test (no auth — expect 401, not 500) ===")
run("curl -s https://145-14-158-100.sslip.io/api/v1/search?q=ahmed -o /dev/null -w 'status: %{http_code}\\n' 2>&1")

run('docker ps --format "table {{.Names}}\t{{.Status}}"')

sftp.close(); c.close()
print("\nDone.")