import os
import paramiko, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd, show=True):
    if show:
        print(f"$ {cmd[:100]}")
    _, o, e = c.exec_command(cmd, get_pty=True)
    out = ""
    for line in o:
        l = line.rstrip()
        if l:
            print(f"  {l}")
            out += l + "\n"
    return out

APP = "/opt/tayyibt"
ENV = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

print("\n=== ai-service logs (last 40 lines) ===")
run(f"docker logs tayyibt-ai-service-1 --tail 40 2>&1")

print("\n=== web logs (last 20 lines) ===")
run(f"docker logs tayyibt-web-1 --tail 20 2>&1")

print("\n=== admin logs (last 20 lines) ===")
run(f"docker logs tayyibt-admin-1 --tail 20 2>&1")

print("\n=== ai-service requirements.txt ===")
run(f"cat {APP}/ai-service/requirements.txt 2>&1")

print("\n=== web healthcheck test ===")
run(f"docker exec tayyibt-web-1 wget -qO- http://127.0.0.1:3000 2>&1 | head -5 || echo 'FAILED'")

print("\n=== admin healthcheck test ===")
run(f"docker exec tayyibt-admin-1 wget -qO- http://127.0.0.1:3001 2>&1 | head -5 || echo 'FAILED'")

c.close()