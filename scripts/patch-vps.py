"""
Patch the running VPS:
1. Upload missing ai-service/app/models/ directory
2. Upload updated docker-compose.vps.yml (HOSTNAME fix)
3. Rebuild only the affected containers
"""
import os
import paramiko, os, time

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = "/opt/tayyibt"
ENV = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
sftp = c.open_sftp()

def run(cmd, show=True):
    if show:
        print(f"$ {cmd[:120]}")
    _, o, e = c.exec_command(cmd, get_pty=True, timeout=600)
    out = ""
    for line in o:
        l = line.rstrip()
        if l:
            print(f"  {l}")
            out += l + "\n"
    o.channel.recv_exit_status()
    return out

def upload_file(local, remote):
    remote_dir = os.path.dirname(remote)
    run(f"mkdir -p {remote_dir}", show=False)
    with open(local, "rb") as f:
        data = f.read()
    with sftp.open(remote, "wb") as rf:
        rf.write(data)
    print(f"  uploaded {os.path.basename(local)} -> {remote}")

print("\n=== 1. Upload missing models/ directory ===")
models_dir = os.path.join(PROJECT, "ai-service", "app", "models")
for fname in os.listdir(models_dir):
    local = os.path.join(models_dir, fname)
    remote = f"{APP}/ai-service/app/models/{fname}"
    if os.path.isfile(local):
        upload_file(local, remote)

print("\n=== 2. Upload updated docker-compose.vps.yml ===")
upload_file(
    os.path.join(PROJECT, "docker-compose.vps.yml"),
    f"{APP}/docker-compose.vps.yml"
)

print("\n=== 3. Rebuild and restart ai-service ===")
run(f"cd {APP} && {COMPOSE} up -d --build --no-deps ai-service 2>&1")

print("\n=== 4. Restart web and admin (pick up HOSTNAME env) ===")
run(f"cd {APP} && {COMPOSE} up -d --no-deps web admin 2>&1")

print("\nWaiting 30s for services to start...")
time.sleep(30)

print("\n=== 5. Final status ===")
run(f'docker ps --format "table {{{{.Names}}}}\t{{{{.Status}}}}\t{{{{.Ports}}}}"')

print("\n=== Health checks ===")
run("curl -sf http://localhost/ -o /dev/null -w 'Web: %{http_code}\\n' 2>&1")
run("curl -sf http://localhost/api/v1/health 2>&1 || echo 'Backend: FAILED'")
run("curl -sf http://localhost/admin/ -o /dev/null -w 'Admin: %{http_code}\\n' 2>&1")
run("curl -sf http://localhost/ai/health -o /dev/null -w 'AI svc: %{http_code}\\n' 2>&1")

sftp.close()
c.close()
print("\nPatch complete.")