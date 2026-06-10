import os
import sys
import tarfile
import posixpath
import paramiko

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INCLUDE = [
    "backend", "web", "admin", "ai-service", "docker", "scripts",
    "docker-compose.vps.yml", "docker-compose.prod.yml", "docker-compose.yml",
    ".dockerignore", "README.md", "CLAUDE.md",
]
EXCLUDE_DIRS = {".git", "node_modules", ".next", "dist", "__pycache__", ".venv", "venv"}

TARBALL = os.path.join(REPO, "app.tar.gz")


def filt(ti: tarfile.TarInfo):
    parts = ti.name.split("/")
    if any(p in EXCLUDE_DIRS for p in parts):
        return None
    return ti


print("=== building tarball ===")
with tarfile.open(TARBALL, "w:gz") as tar:
    for item in INCLUDE:
        path = os.path.join(REPO, item)
        if not os.path.exists(path):
            print("  MISSING:", item)
            continue
        tar.add(path, arcname=item, filter=filt)
print("  ->", TARBALL, os.path.getsize(TARBALL), "bytes")

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("145.14.158.100", username="root", password=os.environ.get("VPS_PASSWORD", ""),
          timeout=60, banner_timeout=60, auth_timeout=60)

print("\n=== uploading to VPS:/tmp/app.tar.gz ===")
sftp = c.open_sftp()
sftp.put(TARBALL, "/tmp/app.tar.gz")
sftp.close()
print("  uploaded")


def run(cmd, get_pty=False):
    chan = c.get_transport().open_session()
    chan.set_combine_stderr(True)
    if get_pty:
        chan.get_pty()
    chan.exec_command(cmd)
    out = b""
    while True:
        if chan.recv_ready():
            out += chan.recv(65536)
        if chan.exit_status_ready() and not chan.recv_ready():
            break
    while chan.recv_ready():
        out += chan.recv(65536)
    code = chan.recv_exit_status()
    return code, out.decode(errors="replace")


# The exact ssh-action script from .github/workflows/deploy.yml
script = r'''
set -e
mkdir -p /opt/tayyibt
command -v rsync >/dev/null 2>&1 || (apt-get update -qq && apt-get install -y -qq rsync)
rm -rf /tmp/tayyibt_new
mkdir -p /tmp/tayyibt_new
tar xzf /tmp/app.tar.gz -C /tmp/tayyibt_new
rm -f /tmp/app.tar.gz
rsync -a --delete \
  --exclude='.env.production' \
  --exclude='.env' \
  --exclude='certs/' \
  --exclude='.git/' \
  /tmp/tayyibt_new/ /opt/tayyibt/
rm -rf /tmp/tayyibt_new
chmod +x /opt/tayyibt/scripts/cd-deploy.sh || true
bash /opt/tayyibt/scripts/cd-deploy.sh
'''

print("\n=== running deploy script on VPS (this rebuilds the stack; may take minutes) ===")
code, out = run(script)
print(out)
print(f"\n=== deploy script exit code: {code} ===")

os.remove(TARBALL)
c.close()
sys.exit(code)
