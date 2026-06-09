"""
Deploy updated AI service + start Ollama + pull gemma3:4b model.
"""
import os
import paramiko, os, time

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP     = "/opt/tayyibt"
ENV     = f"{APP}/.env.production"
COMPOSE = f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"
AI_SRC  = os.path.join(PROJECT, "ai-service")

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting..."); c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60); print("Connected.\n")
sftp = c.open_sftp()

def run(cmd, show=True, timeout=600):
    if show: print(f"$ {cmd[:120]}")
    _, o, e = c.exec_command(cmd, get_pty=True, timeout=timeout)
    out = ""
    for line in o:
        l = line.rstrip()
        if l: print(f"  {l}"); out += l + "\n"
    o.channel.recv_exit_status()
    return out

def upload_file(local, remote):
    run(f"mkdir -p {os.path.dirname(remote)}", show=False)
    with open(local, "rb") as f: data = f.read()
    with sftp.open(remote, "wb") as rf: rf.write(data)
    print(f"  -> {remote}")

def upload_dir(local_dir, remote_dir):
    for root, dirs, files in os.walk(local_dir):
        dirs[:] = [d for d in dirs if d not in {"__pycache__", ".venv", "venv"}]
        for fname in files:
            if fname.endswith(".pyc"): continue
            local  = os.path.join(root, fname)
            rel    = os.path.relpath(local, local_dir)
            remote = remote_dir + "/" + rel.replace("\\", "/")
            upload_file(local, remote)


print("=" * 55)
print("STEP 1: Upload updated AI service source")
print("=" * 55)
upload_dir(AI_SRC, f"{APP}/ai-service")

print("\nUploading docker-compose.vps.yml...")
upload_file(os.path.join(PROJECT, "docker-compose.vps.yml"), f"{APP}/docker-compose.vps.yml")


print("\n" + "=" * 55)
print("STEP 2: Rebuild ai-service image")
print("=" * 55)
run(f"cd {APP} && {COMPOSE} build --no-cache ai-service 2>&1", timeout=600)


print("\n" + "=" * 55)
print("STEP 3: Start Ollama service")
print("=" * 55)
run(f"cd {APP} && {COMPOSE} up -d ollama 2>&1")
print("Waiting 20s for Ollama to be ready...")
time.sleep(20)
run(f"docker exec tayyibt-ollama-1 ollama list 2>&1 || echo 'ollama starting'")


print("\n" + "=" * 55)
print("STEP 4: Pull gemma3:4b model (~2.5 GB — takes a few minutes)")
print("=" * 55)
run("docker exec tayyibt-ollama-1 ollama pull gemma3:4b 2>&1", timeout=600)


print("\n" + "=" * 55)
print("STEP 5: Restart ai-service with new code")
print("=" * 55)
run(f"cd {APP} && {COMPOSE} up -d --no-deps ai-service 2>&1")
time.sleep(15)


print("\n" + "=" * 55)
print("STEP 6: Verify all services")
print("=" * 55)
run('docker ps --format "table {{.Names}}\t{{.Status}}"')

print("\n--- Endpoint tests ---")
run("curl -sf https://145-14-158-100.sslip.io/ai/health && echo '  AI health: OK'")
run("curl -sf -X POST https://145-14-158-100.sslip.io/ai/api/v1/moderate "
    "-H 'Content-Type: application/json' "
    "-d '{\"content\": \"Hello, looking forward to connecting!\", \"content_type\": \"post\"}' 2>&1")

print("\n--- Ollama model list ---")
run("docker exec tayyibt-ollama-1 ollama list 2>&1")

sftp.close(); c.close()
print("\n" + "=" * 55)
print("  AI service deployed with local Gemma 3 4B")
print("  Endpoints:")
print("  POST /ai/api/v1/match          — compatibility score")
print("  POST /ai/api/v1/bio-suggestion — profile bio generator")
print("  POST /ai/api/v1/icebreaker     — conversation starters")
print("  POST /ai/api/v1/moderate       — content moderation")
print("  POST /ai/api/v1/profile-tips   — profile completeness tips")
print("=" * 55)