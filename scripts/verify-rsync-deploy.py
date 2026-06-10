import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD', ''),
          timeout=60, banner_timeout=60, auth_timeout=60)


def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read().decode() + e.read().decode()).strip()


# Build a controlled scenario that mirrors the real deploy:
#   src/  = what the repo ships (NO .env.production, NO certs/)
#   dst/  = the live /opt/tayyibt (has secrets + a stale/dead file)
setup = r'''
set -e
rm -rf /tmp/rsynctest && mkdir -p /tmp/rsynctest/src /tmp/rsynctest/dst
# Repo-shipped tree
mkdir -p /tmp/rsynctest/src/web/src/components/layout
echo "blue banner" > /tmp/rsynctest/src/web/src/components/layout/UnderConstructionBanner.tsx
# Live tree: same active file + VPS-only secrets + a DEAD duplicate that was
# deleted from the repo (the exact bug we are preventing).
mkdir -p /tmp/rsynctest/dst/web/src/components/layout /tmp/rsynctest/dst/certs
echo "old red banner"   > /tmp/rsynctest/dst/web/src/components/layout/UnderConstructionBanner.tsx
echo "DEAD DUPLICATE"   > /tmp/rsynctest/dst/web/src/components/layout/underconstarctionsbanner.tsx
echo "SECRET=keepme"    > /tmp/rsynctest/dst/.env.production
echo "fullchain"        > /tmp/rsynctest/dst/certs/fullchain.pem
'''
print(run(setup) or "[setup ok]")

print("\n=== DRY-RUN: what the deploy WOULD change (-n) ===")
print(run(
    "rsync -a --delete -n -v "
    "--exclude='.env.production' --exclude='.env' "
    "--exclude='certs/' --exclude='.git/' "
    "/tmp/rsynctest/src/ /tmp/rsynctest/dst/"
))

print("\n=== APPLY for real (on scratch dirs only) ===")
run(
    "rsync -a --delete "
    "--exclude='.env.production' --exclude='.env' "
    "--exclude='certs/' --exclude='.git/' "
    "/tmp/rsynctest/src/ /tmp/rsynctest/dst/"
)

print("\n=== RESULT: dst tree after sync ===")
print(run("cd /tmp/rsynctest/dst && find . -type f | sort"))

print("\n=== ASSERTIONS ===")
print("dead duplicate removed :",
      run("test ! -f /tmp/rsynctest/dst/web/src/components/layout/underconstarctionsbanner.tsx "
          "&& echo PASS || echo FAIL"))
print(".env.production kept   :",
      run("grep -q keepme /tmp/rsynctest/dst/.env.production && echo PASS || echo FAIL"))
print("certs/ kept            :",
      run("test -f /tmp/rsynctest/dst/certs/fullchain.pem && echo PASS || echo FAIL"))
print("active file updated    :",
      run("grep -q 'blue banner' /tmp/rsynctest/dst/web/src/components/layout/UnderConstructionBanner.tsx "
          "&& echo PASS || echo FAIL"))

run("rm -rf /tmp/rsynctest")
print("\n[cleanup done]")
c.close()
