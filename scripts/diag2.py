import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

print("=== ai-service app tree ===")
print(run("find /opt/tayyibt/ai-service/app -type f -name '*.py' | sort"))

print("\n=== matching.py imports ===")
print(run("cat /opt/tayyibt/ai-service/app/api/v1/matching.py"))

print("\n=== main.py ===")
print(run("cat /opt/tayyibt/ai-service/app/main.py"))

print("\n=== web env inside container ===")
print(run("docker exec tayyibt-web-1 env | grep -E 'HOSTNAME|PORT|NODE'"))

print("\n=== web netstat ===")
print(run("docker exec tayyibt-web-1 ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null | head -10"))

c.close()