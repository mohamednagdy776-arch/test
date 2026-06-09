import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    out = o.read().decode()
    err = e.read().decode()
    return (out + err).strip()

print("=== DOCKER CONTAINERS ===")
print(run('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'))

print("\n=== DOCKER COMPOSE STATUS ===")
print(run('docker compose -f /opt/tayyibt/docker-compose.vps.yml ps 2>&1'))

print("\n=== APP DIR ===")
print(run('ls /opt/tayyibt/ 2>&1'))

print("\n=== PORT 80 ===")
print(run('curl -sf http://localhost/ -o /dev/null -w "%{http_code}" 2>&1 || echo FAILED'))

print("\n=== BACKEND HEALTH ===")
print(run('curl -sf http://localhost/api/v1/health 2>&1 || echo FAILED'))

print("\n=== DISK ===")
print(run('df -h / 2>&1'))

c.close()