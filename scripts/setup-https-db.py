"""
Phase 2: Set up HTTPS (self-signed cert) + fix DB schema sync
1. Generate self-signed SSL cert on VPS
2. Upload updated nginx SSL config, docker-compose.vps.yml, .env.production, app.module.ts
3. Rebuild backend (TYPEORM_SYNCHRONIZE), web, admin (HTTPS URLs)
4. Restart nginx with SSL
5. Verify all services + DB tables
"""
import os
import paramiko, os, time

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP     = "/opt/tayyibt"
ENV     = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting to VPS...")
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
print("Connected.\n")
sftp = c.open_sftp()

def run(cmd, show=True, timeout=900):
    if show:
        print(f"$ {cmd[:120]}")
    _, o, e = c.exec_command(cmd, get_pty=True, timeout=timeout)
    out = ""
    for line in o:
        l = line.rstrip()
        if l:
            print(f"  {l}")
            out += l + "\n"
    o.channel.recv_exit_status()
    return out

def upload(local_rel, remote_path):
    local = os.path.join(PROJECT, *local_rel.split("/"))
    with open(local, "rb") as f:
        data = f.read()
    sftp.open(remote_path, "wb").write(data)
    print(f"  uploaded -> {remote_path}")


# ── 1. Generate self-signed SSL cert ─────────────────────────────────────────
print("=" * 60)
print("STEP 1: Generate self-signed SSL certificate")
print("=" * 60)
run(f"mkdir -p {APP}/certs")
run(
    f'openssl req -x509 -newkey rsa:4096 '
    f'-keyout {APP}/certs/privkey.pem '
    f'-out {APP}/certs/fullchain.pem '
    f'-days 365 -nodes '
    f'-subj "/CN=145.14.158.100" '
    f'-addext "subjectAltName=IP:145.14.158.100" 2>&1'
)
run(f"chmod 600 {APP}/certs/privkey.pem", show=False)
print("Certificate generated.\n")


# ── 2. Upload changed files ───────────────────────────────────────────────────
print("=" * 60)
print("STEP 2: Upload updated config files")
print("=" * 60)

upload("docker/nginx/nginx.conf",        f"{APP}/docker/nginx/nginx.conf")
upload("docker-compose.vps.yml",          f"{APP}/docker-compose.vps.yml")
upload(".env.production",                 f"{APP}/.env.production")
run(f"chmod 600 {ENV}", show=False)

# Upload changed backend source (app.module.ts with TYPEORM_SYNCHRONIZE support)
run(f"mkdir -p {APP}/backend/src", show=False)
upload("backend/src/app.module.ts",       f"{APP}/backend/src/app.module.ts")
print()


# ── 3. Rebuild backend (picks up TYPEORM_SYNCHRONIZE code change) ─────────────
print("=" * 60)
print("STEP 3: Rebuild backend (DB schema sync support)")
print("=" * 60)
run(f"cd {APP} && {COMPOSE} build --no-cache backend 2>&1", timeout=600)
run(f"cd {APP} && {COMPOSE} up -d --no-deps backend 2>&1")
print("Waiting 20s for backend + DB sync...")
time.sleep(20)

# Check tables were created
print("\nDB tables after sync:")
env_vals = {}
for line in run(f"cat {ENV}", show=False).splitlines():
    if "=" in line and not line.startswith("#"):
        k, _, v = line.partition("=")
        env_vals[k.strip()] = v.strip()
db_user = env_vals.get("DB_USER", "tayyibt_user")
db_name = env_vals.get("DB_NAME", "tayyibt_prod")
run(f"docker exec tayyibt-postgres-1 psql -U {db_user} -d {db_name} -c '\\dt' 2>&1")
print()


# ── 4. Rebuild web + admin (HTTPS URLs baked in) ──────────────────────────────
print("=" * 60)
print("STEP 4: Rebuild web & admin with HTTPS URLs")
print("=" * 60)
run(f"cd {APP} && {COMPOSE} build --no-cache web admin 2>&1", timeout=900)
run(f"cd {APP} && {COMPOSE} up -d --no-deps web admin 2>&1")
print()


# ── 5. Restart nginx with SSL config ─────────────────────────────────────────
print("=" * 60)
print("STEP 5: Restart nginx with SSL")
print("=" * 60)
run(f"cd {APP} && {COMPOSE} up -d --no-deps nginx 2>&1")
time.sleep(10)
run("nginx -t 2>&1 || docker exec tayyibt-nginx-1 nginx -t 2>&1")
print()


# ── 6. Wait and final health checks ──────────────────────────────────────────
print("=" * 60)
print("STEP 6: Final health checks")
print("=" * 60)
print("Waiting 30s for services to stabilize...")
time.sleep(30)

run('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
print()
run("curl -sf -k https://localhost/               -o /dev/null -w 'Web (HTTPS):    %{http_code}\\n'")
run("curl -sf -k https://localhost/api/v1/health              -w '\\nBackend health: OK\\n' || echo 'FAILED'")
run("curl -sf -k https://localhost/admin/         -o /dev/null -w 'Admin (HTTPS):  %{http_code}\\n'")
run("curl -sf    http://localhost/                -o /dev/null -w 'HTTP redirect:  %{http_code}\\n'")
print()

# DB table count
run(f"docker exec tayyibt-postgres-1 psql -U {db_user} -d {db_name} "
    f"-c \"SELECT COUNT(*) AS table_count FROM information_schema.tables "
    f"WHERE table_schema='public';\" 2>&1")

sftp.close()
c.close()

print()
print("=" * 60)
print("  DONE")
print("  HTTPS: https://145.14.158.100  (self-signed — browser will warn)")
print("  HTTP redirects to HTTPS automatically")
print("=" * 60)