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

def run(cmd, timeout=300):
    print(f"$ {cmd[:100]}")
    _, o, e = c.exec_command(cmd, get_pty=True, timeout=timeout)
    for line in o:
        l = line.rstrip()
        if l: print(f"  {l}")
    o.channel.recv_exit_status()

# Upload fixed scoring.py
local = os.path.join(PROJECT, "ai-service", "app", "services", "scoring.py")
with open(local, "rb") as f: data = f.read()
sftp.open(f"{APP}/ai-service/app/services/scoring.py", "wb").write(data)
print("Uploaded scoring.py")

# Rebuild and restart ai-service
run(f"cd {APP} && {COMPOSE} build --no-cache ai-service 2>&1", timeout=300)
run(f"cd {APP} && {COMPOSE} up -d --no-deps ai-service 2>&1")
time.sleep(10)
run('docker ps --format "table {{.Names}}\t{{.Status}}"')

sftp.close(); c.close()
print("Done.")