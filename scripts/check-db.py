import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

# Read DB creds from env file
env = {}
for line in run("cat /opt/tayyibt/.env.production").splitlines():
    if "=" in line and not line.startswith("#"):
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip()

db_user = env.get("DB_USER", "tayyibt_user")
db_pass = env.get("DB_PASSWORD", "")
db_name = env.get("DB_NAME", "tayyibt_prod")

print("=== DB connection test ===")
print(run(f"docker exec tayyibt-postgres-1 psql -U {db_user} -d {db_name} -c '\\l' 2>&1"))

print("\n=== Tables in DB ===")
print(run(f"docker exec tayyibt-postgres-1 psql -U {db_user} -d {db_name} -c '\\dt' 2>&1"))

print("\n=== Backend migration scripts ===")
print(run("cat /opt/tayyibt/backend/package.json 2>&1 | python3 -c \"import sys,json; d=json.load(sys.stdin); [print(k,':',v) for k,v in d.get('scripts',{}).items()]\""))

print("\n=== Backend dist/main exists? ===")
print(run("ls /opt/tayyibt/backend/dist/main.js 2>&1 || echo NOT FOUND"))

print("\n=== TypeORM migration files ===")
print(run("find /opt/tayyibt/backend -name '*migration*' -o -name 'Migration*' 2>/dev/null | grep -v node_modules | head -20"))

c.close()