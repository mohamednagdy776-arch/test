import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD', ''),
          timeout=60, banner_timeout=60, auth_timeout=60)


def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read().decode() + e.read().decode()).strip()


print("=== containers ===")
print(run("docker ps --format 'table {{.Names}}\t{{.Status}}'"))
print("\n=== health ===")
print(run("curl -s -o /dev/null -w '%{http_code}' http://localhost/api/v1/health"))
print("\n=== /opt/tayyibt top-level ===")
print(run("ls -A1 /opt/tayyibt"))
print("\n=== secrets preserved? ===")
print("env.production:", run("test -f /opt/tayyibt/.env.production && echo YES || echo NO"))
print("certs/:", run("ls /opt/tayyibt/certs 2>&1 | head -3"))
print("\n=== banner state ===")
print("duplicate:", run("test -e /opt/tayyibt/web/src/components/layout/underconstarctionsbanner.tsx && echo PRESENT || echo GONE"))
print("active color:", run("grep -o 'bg-\\(green\\|blue\\|red\\)-600' /opt/tayyibt/web/src/components/layout/UnderConstructionBanner.tsx | head -1"))
print("\n=== leftover tmp from deploy ===")
print(run("ls -A1 /tmp/tayyibt_new 2>&1 | head -5; echo '---'; ls -la /tmp/app.tar.gz 2>&1"))
print("\n=== rsync available ===")
print(run("command -v rsync || echo MISSING"))
print("\n=== last lines of any cd-deploy log / recent docker events ===")
print(run("docker compose -f /opt/tayyibt/docker-compose.vps.yml --env-file /opt/tayyibt/.env.production ps 2>&1 | head -20"))

c.close()
