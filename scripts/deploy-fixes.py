"""
Deploy all QA fixes: upload changed backend + web source via a single tar,
rebuild backend + web, restart. Uses ONE SSH connection to avoid throttling.
"""
import os
import paramiko, os, io, tarfile, time, sys

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP     = "/opt/tayyibt"
ENV     = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"

EXCLUDE_DIRS = {"node_modules", ".next", "dist", "__pycache__"}
EXCLUDE_EXT  = {".js", ".js.map", ".d.ts", ".tsbuildinfo"}

# Directories to sync (relative to project root)
SYNC = ["backend/src", "web/src", "web/public"]

def build_tar():
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for rel in SYNC:
            base = os.path.join(PROJECT, *rel.split("/"))
            for root, dirs, files in os.walk(base):
                dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
                for f in files:
                    _, ext = os.path.splitext(f)
                    # keep .js/.css only under web/public; skip compiled TS output elsewhere
                    if ext in EXCLUDE_EXT and "web/public" not in root.replace("\\", "/"):
                        continue
                    full = os.path.join(root, f)
                    arc = os.path.relpath(full, PROJECT).replace("\\", "/")
                    tar.add(full, arcname=arc)
    buf.seek(0)
    return buf.read()

def main():
    print("Connecting (single session)...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    for attempt in range(5):
        try:
            c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
                      timeout=40, banner_timeout=40, auth_timeout=40)
            break
        except Exception as e:
            print(f"  retry {attempt+1} ({type(e).__name__})"); time.sleep((attempt+1)*15)
    else:
        print("Could not connect."); sys.exit(1)
    print("Connected.\n")

    def run(cmd, timeout=900):
        print(f"$ {cmd[:100]}")
        _, o, e = c.exec_command(cmd, get_pty=True, timeout=timeout)
        out = ""
        for line in o:
            l = line.rstrip()
            if l: print(f"  {l}"); out += l + "\n"
        o.channel.recv_exit_status()
        return out

    # 1. Upload tar
    print("=== 1. Building + uploading source archive ===")
    data = build_tar()
    print(f"  archive: {len(data)/1024:.0f} KB")
    sftp = c.open_sftp()
    with sftp.open("/tmp/fixes.tar.gz", "wb") as f:
        f.write(data)
    sftp.close()
    run(f"tar -xzf /tmp/fixes.tar.gz -C {APP} && rm /tmp/fixes.tar.gz && echo extracted")

    # 2. Rebuild backend
    print("\n=== 2. Rebuild backend ===")
    run(f"cd {APP} && {COMPOSE} build backend 2>&1", timeout=900)

    # 3. Rebuild web
    print("\n=== 3. Rebuild web ===")
    run(f"cd {APP} && {COMPOSE} build web 2>&1", timeout=900)

    # 4. Restart both
    print("\n=== 4. Restart backend + web ===")
    run(f"cd {APP} && {COMPOSE} up -d --no-deps backend web 2>&1")
    print("Waiting 25s...")
    time.sleep(25)

    # 5. Status + health
    print("\n=== 5. Status ===")
    run('docker ps --format "table {{.Names}}\t{{.Status}}"')
    run("curl -sf https://145-14-158-100.sslip.io/api/v1/health && echo")
    run("curl -s -o /dev/null -w 'terms page: %{http_code}\\n' https://145-14-158-100.sslip.io/terms")
    run("curl -s -o /dev/null -w 'robots: %{http_code}\\n' https://145-14-158-100.sslip.io/robots.txt")

    c.close()
    print("\nDeploy complete.")

if __name__ == "__main__":
    main()