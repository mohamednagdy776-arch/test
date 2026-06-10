import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD', ''),
          timeout=60, banner_timeout=60, auth_timeout=60)


def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read().decode() + e.read().decode()).strip()


print("HTTPS health   :", run("curl -s -o /dev/null -w '%{http_code}' https://145-14-158-100.sslip.io/api/v1/health"))
print("HTTPS homepage :", run("curl -s -o /dev/null -w '%{http_code}' https://145-14-158-100.sslip.io/"))
web = run("docker ps -qf name=web | head -1")
print("green in build :", run(f"docker exec {web} sh -c \"grep -rl 'bg-green-600' /app/.next 2>/dev/null | head -1\"") or "NOT FOUND")
print("blue in build  :", run(f"docker exec {web} sh -c \"grep -rl 'bg-blue-600' /app/.next 2>/dev/null | grep -i banner | head -1\"") or "none (good)")
c.close()
