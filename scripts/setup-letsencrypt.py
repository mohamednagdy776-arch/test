"""
Set up trusted HTTPS using Let's Encrypt + sslip.io
  Domain: 145-14-158-100.sslip.io  →  automatically resolves to 145.14.158.100
Steps:
  1. Verify DNS resolves
  2. Install certbot
  3. Stop nginx, get cert via standalone, restart nginx
  4. Copy certs to /opt/tayyibt/certs/
  5. Update nginx server_name
  6. Update .env.production with new domain URLs
  7. Rebuild web + admin (NEXT_PUBLIC URLs baked in)
  8. Set up auto-renewal cron
  9. Final health check
"""
import os
import paramiko, time, os

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP     = "/opt/tayyibt"
ENV     = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"
DOMAIN  = "145-14-158-100.sslip.io"
EMAIL   = "admin@tayyibt.com"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting to VPS...")
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
print("Connected.\n")
sftp = c.open_sftp()

def run(cmd, show=True, timeout=600):
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
    local = os.path.join(PROJECT, *local_rel.replace("/","\\").split("\\"))
    with open(local, "rb") as f:
        data = f.read()
    sftp.open(remote_path, "wb").write(data)
    print(f"  uploaded -> {remote_path}")


# ── 1. Verify DNS ─────────────────────────────────────────────────────────────
print("=" * 60)
print(f"STEP 1: Verify {DOMAIN} resolves to VPS IP")
print("=" * 60)
resolved = run(f"dig +short {DOMAIN} A 2>/dev/null | head -1")
if "145.14.158.100" not in resolved:
    # sslip.io always resolves — try curl as fallback check
    alt = run(f"curl -s https://dns.google/resolve?name={DOMAIN}&type=A 2>/dev/null | python3 -c \"import sys,json; d=json.load(sys.stdin); [print(a['data']) for a in d.get('Answer',[])]\" 2>/dev/null | head -1")
    if "145.14.158.100" not in alt:
        print(f"WARNING: DNS check inconclusive ({resolved.strip()}), proceeding anyway — sslip.io always resolves")
    else:
        print(f"DNS OK via Google: {alt.strip()}")
else:
    print(f"DNS OK: {DOMAIN} -> {resolved.strip()}")
print()


# ── 2. Install certbot ────────────────────────────────────────────────────────
print("=" * 60)
print("STEP 2: Install certbot")
print("=" * 60)
run("apt-get install -y -qq certbot 2>&1")
run("certbot --version 2>&1")
print()


# ── 3. Stop nginx, get cert, restart nginx ────────────────────────────────────
print("=" * 60)
print("STEP 3: Obtain Let's Encrypt certificate")
print("=" * 60)
print("Stopping nginx container (freeing port 80 for ACME challenge)...")
run(f"{COMPOSE} stop nginx 2>&1")
time.sleep(3)

print(f"\nRequesting cert for {DOMAIN}...")
cert_result = run(
    f"certbot certonly --standalone "
    f"-d {DOMAIN} "
    f"--non-interactive --agree-tos "
    f"--email {EMAIL} --no-eff-email 2>&1",
    timeout=120
)

if "Congratulations" in cert_result or "Certificate not yet due" in cert_result or "Successfully received" in cert_result:
    print("\nLet's Encrypt certificate obtained successfully!")
    CERT_DIR = f"/etc/letsencrypt/live/{DOMAIN}"
else:
    print("\nLet's Encrypt failed. Will keep self-signed cert.")
    print("Restarting nginx with existing self-signed cert...")
    run(f"{COMPOSE} start nginx 2>&1")
    c.close()
    exit(1)

# Copy certs to app dir
run(f"cp -f {CERT_DIR}/fullchain.pem {APP}/certs/fullchain.pem")
run(f"cp -f {CERT_DIR}/privkey.pem   {APP}/certs/privkey.pem")
run(f"chmod 600 {APP}/certs/privkey.pem", show=False)
print()


# ── 4. Update nginx server_name ───────────────────────────────────────────────
print("=" * 60)
print("STEP 4: Update nginx config with real domain")
print("=" * 60)
nginx_conf = f"""upstream backend {{
    server backend:3000;
}}

upstream admin {{
    server admin:3001;
}}

upstream web {{
    server web:3000;
}}

upstream ai_service {{
    server ai-service:5000;
}}

# Redirect HTTP to HTTPS
server {{
    listen 80;
    server_name {DOMAIN} 145.14.158.100;
    return 301 https://{DOMAIN}$request_uri;
}}

# HTTPS server
server {{
    listen 443 ssl http2;
    server_name {DOMAIN};

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 20M;

    location /api/ {{
        proxy_pass         http://backend;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }}

    location /socket.io/ {{
        proxy_pass         http://backend;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_read_timeout 86400;
    }}

    location /ai/ {{
        proxy_pass         http://ai_service/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }}

    location /admin/ {{
        proxy_pass         http://admin/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }}

    location / {{
        proxy_pass         http://web;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }}
}}
"""
with sftp.open(f"{APP}/docker/nginx/nginx.conf", "w") as f:
    f.write(nginx_conf)
print(f"nginx.conf updated with server_name {DOMAIN}")
print()


# ── 5. Update .env.production with new domain URLs ────────────────────────────
print("=" * 60)
print("STEP 5: Update .env.production with HTTPS domain URLs")
print("=" * 60)
env_content = run(f"cat {ENV}", show=False)
env_content = env_content.replace(
    "CORS_ORIGIN=https://145.14.158.100",
    f"CORS_ORIGIN=https://{DOMAIN}"
).replace(
    "CORS_ORIGIN=http://145.14.158.100",
    f"CORS_ORIGIN=https://{DOMAIN}"
).replace(
    "NEXT_PUBLIC_API_URL=https://145.14.158.100/api/v1",
    f"NEXT_PUBLIC_API_URL=https://{DOMAIN}/api/v1"
).replace(
    "NEXT_PUBLIC_API_URL=http://145.14.158.100/api/v1",
    f"NEXT_PUBLIC_API_URL=https://{DOMAIN}/api/v1"
).replace(
    "NEXT_PUBLIC_WS_URL=https://145.14.158.100",
    f"NEXT_PUBLIC_WS_URL=https://{DOMAIN}"
).replace(
    "NEXT_PUBLIC_WS_URL=http://145.14.158.100",
    f"NEXT_PUBLIC_WS_URL=https://{DOMAIN}"
)
with sftp.open(ENV, "w") as f:
    f.write(env_content)
run(f"chmod 600 {ENV}", show=False)
print(f"Env updated: NEXT_PUBLIC_API_URL=https://{DOMAIN}/api/v1")
print()


# ── 6. Rebuild web + admin with new domain URLs ───────────────────────────────
print("=" * 60)
print("STEP 6: Rebuild web & admin (baking in new HTTPS domain URLs)")
print("=" * 60)
run(f"cd {APP} && {COMPOSE} build --no-cache web admin 2>&1", timeout=900)
print()


# ── 7. Start everything ───────────────────────────────────────────────────────
print("=" * 60)
print("STEP 7: Start all services")
print("=" * 60)
run(f"cd {APP} && {COMPOSE} up -d --remove-orphans 2>&1")
print("Waiting 35s for services to stabilize...")
time.sleep(35)
print()


# ── 8. Auto-renewal cron ──────────────────────────────────────────────────────
print("=" * 60)
print("STEP 8: Set up auto-renewal cron")
print("=" * 60)
renew_script = f"""#!/bin/bash
# Renew Let's Encrypt cert and reload nginx
{COMPOSE} stop nginx
certbot renew --quiet
cp -f {CERT_DIR}/fullchain.pem {APP}/certs/fullchain.pem
cp -f {CERT_DIR}/privkey.pem   {APP}/certs/privkey.pem
chmod 600 {APP}/certs/privkey.pem
{COMPOSE} start nginx
"""
with sftp.open("/opt/tayyibt/scripts/renew-cert.sh", "w") as f:
    f.write(renew_script)
run("chmod +x /opt/tayyibt/scripts/renew-cert.sh", show=False)
run("(crontab -l 2>/dev/null | grep -v renew-cert; echo '0 3 * * 1 /opt/tayyibt/scripts/renew-cert.sh >> /var/log/cert-renew.log 2>&1') | crontab -")
print("Cron set: cert renews every Monday at 03:00")
print()


# ── 9. Final checks ───────────────────────────────────────────────────────────
print("=" * 60)
print("STEP 9: Final health checks")
print("=" * 60)
run(f'docker ps --format "table {{{{.Names}}}}\t{{{{.Status}}}}\t{{{{.Ports}}}}"')
print()
run(f"curl -sf  https://{DOMAIN}/               -o /dev/null -w 'Web HTTPS:      %{{http_code}}\\n'")
run(f"curl -sf  https://{DOMAIN}/api/v1/health  -w '\\n'")
run(f"curl -sf  https://{DOMAIN}/admin/         -o /dev/null -w 'Admin HTTPS:    %{{http_code}}\\n'")
run(f"curl -sf  http://145.14.158.100/          -o /dev/null -w 'HTTP redirect:  %{{http_code}}\\n'")
print()
run(f"echo | openssl s_client -connect {DOMAIN}:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates 2>/dev/null")

sftp.close()
c.close()

print()
print("=" * 60)
print("  HTTPS SETUP COMPLETE")
print(f"  URL:   https://{DOMAIN}")
print(f"  Admin: https://{DOMAIN}/admin/")
print(f"  API:   https://{DOMAIN}/api/v1")
print("  Certificate: Let's Encrypt (trusted by all browsers)")
print("  Auto-renewal: every Monday 03:00")
print("=" * 60)