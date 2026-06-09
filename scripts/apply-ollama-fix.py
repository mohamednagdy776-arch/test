import os
import paramiko, os

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = "/opt/tayyibt"
ENV = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
sftp = c.open_sftp()

def run(cmd):
    print(f"$ {cmd[:100]}")
    _, o, e = c.exec_command(cmd, get_pty=True)
    for line in o:
        l = line.rstrip()
        if l: print(f"  {l}")
    o.channel.recv_exit_status()

# Upload fixed compose
with open(os.path.join(PROJECT, "docker-compose.vps.yml"), "rb") as f:
    sftp.open(f"{APP}/docker-compose.vps.yml", "wb").write(f.read())
print("Uploaded docker-compose.vps.yml")

# Restart Ollama so healthcheck picks up
run(f"cd {APP} && {COMPOSE} up -d --no-deps ollama 2>&1")
import time; time.sleep(10)

run('docker ps --format "table {{.Names}}\t{{.Status}}"')

sftp.close(); c.close()