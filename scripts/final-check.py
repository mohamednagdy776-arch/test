import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

print("=== Container status ===")
print(run('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'))

print("\n=== HTTPS check (self-signed, -k skips cert verify) ===")
print(run("curl -sk https://localhost/ -o /dev/null -w 'Web HTTPS: %{http_code}'"))
print(run("curl -sk https://localhost/api/v1/health"))
print(run("curl -sk https://localhost/admin/ -o /dev/null -w 'Admin HTTPS: %{http_code}'"))
print(run("curl -s  http://localhost/ -o /dev/null -w 'HTTP redirect: %{http_code}'"))

print("\n=== SSL cert info ===")
print(run("echo | openssl s_client -connect localhost:443 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null"))

print("\n=== Database tables ===")
db_user = "tayyibt_user"
db_name = "tayyibt_prod"
print(run(f"docker exec tayyibt-postgres-1 psql -U {db_user} -d {db_name} -c '\\dt' 2>&1"))

print("\n=== Table count ===")
print(run(f"docker exec tayyibt-postgres-1 psql -U {db_user} -d {db_name} "
          f"-c \"SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema='public';\" 2>&1"))

print("\n=== Backend logs (last 15) ===")
print(run("docker logs tayyibt-backend-1 --tail 15 2>&1"))

c.close()