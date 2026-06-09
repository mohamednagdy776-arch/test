"""
Fix ai-service:
1. Upload corrected config.py (extra='ignore')
2. Delete all junk *.py files from ai-service root on VPS
3. Rebuild and restart ai-service
4. Test all new endpoints
"""
import os
import paramiko, os, time

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP     = "/opt/tayyibt"
ENV     = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
sftp = c.open_sftp()
print("Connected.\n")

def run(cmd, show=True, timeout=600):
    if show: print(f"$ {cmd[:120]}")
    _, o, e = c.exec_command(cmd, get_pty=True, timeout=timeout)
    out = ""
    for line in o:
        l = line.rstrip()
        if l: print(f"  {l}"); out += l + "\n"
    o.channel.recv_exit_status()
    return out

def upload(local_rel, remote):
    local = os.path.join(PROJECT, *local_rel.split("/"))
    with open(local, "rb") as f: data = f.read()
    with sftp.open(remote, "wb") as rf: rf.write(data)
    print(f"  uploaded -> {remote}")


# 1. Upload fixed config.py
print("=== 1. Upload fixed config.py ===")
upload("ai-service/app/core/config.py", f"{APP}/ai-service/app/core/config.py")

# 2. Clean ALL junk files (keep only app/, requirements.txt, README.md, .dockerignore)
print("\n=== 2. Clean junk files from ai-service root ===")
run(f"""cd {APP}/ai-service && \
find . -maxdepth 1 -name '*.py' -delete && \
find . -maxdepth 1 -name '*.sh' -delete && \
find . -maxdepth 1 -name '*.md' ! -name 'README.md' -delete && \
echo 'cleaned'""")
run(f"ls {APP}/ai-service/")

# 3. Rebuild and restart ai-service
print("\n=== 3. Rebuild ai-service ===")
run(f"cd {APP} && {COMPOSE} build --no-cache ai-service 2>&1", timeout=600)
run(f"cd {APP} && {COMPOSE} up -d --no-deps ai-service 2>&1")
print("Waiting 15s...")
time.sleep(15)

# 4. Test all endpoints (use HTTPS with -L to follow redirects)
print("\n=== 4. Endpoint tests ===")
BASE = "https://145-14-158-100.sslip.io"

run(f"curl -sf {BASE}/ai/health 2>&1")

run(f"""curl -sf -X POST {BASE}/ai/api/v1/profile-tips \
  -H 'Content-Type: application/json' \
  -d '{{"profile": {{"user_id": "u1", "age": 28, "gender": "male", "country": "Egypt"}}}}' 2>&1""")

run(f"""curl -sf -X POST {BASE}/ai/api/v1/moderate \
  -H 'Content-Type: application/json' \
  -d '{{"content": "Looking for a righteous life partner", "content_type": "bio"}}' 2>&1""")

run(f"""curl -sf -X POST {BASE}/ai/api/v1/icebreaker \
  -H 'Content-Type: application/json' \
  -d '{{"user_a_id":"u1","user_b_id":"u2","score":72,"user_b_country":"Saudi Arabia"}}' 2>&1""")

run(f"""curl -sf -X POST {BASE}/ai/api/v1/bio-suggestion \
  -H 'Content-Type: application/json' \
  -d '{{"age":28,"gender":"male","country":"Egypt","occupation":"Engineer","language":"en"}}' 2>&1""")

print("\n=== Container status ===")
run('docker ps --format "table {{.Names}}\t{{.Status}}"')

sftp.close(); c.close()
print("\nDone.")