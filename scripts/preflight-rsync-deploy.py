import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD', ''),
          timeout=60, banner_timeout=60, auth_timeout=60)


def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read().decode() + e.read().decode()).strip()


print("=== rsync installed? ===")
print(run("command -v rsync && rsync --version | head -1 || echo MISSING"))

print("\n=== /opt/tayyibt top-level entries ===")
print(run("ls -A1 /opt/tayyibt"))

# What the deploy tarball ships at the top level (from .github/workflows/deploy.yml)
shipped = {
    "backend", "web", "admin", "ai-service", "docker", "scripts",
    "docker-compose.vps.yml", "docker-compose.prod.yml", "docker-compose.yml",
    "README.md", "CLAUDE.md",
}
# Excluded from --delete (preserved VPS-only state)
preserved = {".env.production", ".env", "certs"}

live = set(run("ls -A1 /opt/tayyibt").splitlines())
would_delete = live - shipped - preserved
print("\n=== Entries that the clean-mirror WOULD remove on first run ===")
print("\n".join(sorted(would_delete)) if would_delete else "(none — VPS already matches the shipped set)")

c.close()
