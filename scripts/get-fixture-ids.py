import os
import sys
import io
import paramiko

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD', ''),
          timeout=60, banner_timeout=60, auth_timeout=60)


def psql(q):
    cmd = f"docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod -t -A -c \"{q}\" 2>&1"
    _, o, e = c.exec_command(cmd)
    return (o.read().decode() + e.read().decode()).strip()


print("admin_username:", psql("SELECT username FROM users WHERE email='admin@tayyibt.com';"))
print("other_username:", psql("SELECT username FROM users WHERE username IS NOT NULL AND email LIKE '%@tayyibt.test' LIMIT 1;"))
print("tables:", psql("SELECT string_agg(table_name, ',') FROM information_schema.tables WHERE table_schema='public';")[:500])
# Try common table names for pages/groups
for t in ('pages', 'page', 'groups', '"group"', 'community_pages', 'community_groups'):
    r = psql(f"SELECT id FROM {t} LIMIT 1;")
    print(f"{t}_id:", r)
c.close()
