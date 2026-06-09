import os
import paramiko, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

print("=== Container status ===")
print(run('docker ps --format "table {{.Names}}\t{{.Status}}"'))

print("\n=== Clean junk files from ai-service ===")
print(run("find /opt/tayyibt/ai-service -maxdepth 1 -name 'do_execute*.py' -o -name 'direct_run.py' | wc -l"))
print(run("find /opt/tayyibt/ai-service -maxdepth 1 -name 'do_execute*.py' -delete -o -name 'direct_run.py' -delete 2>&1 && echo 'cleaned'"))

print("\n=== ai-service root files (clean) ===")
print(run("ls /opt/tayyibt/ai-service/"))

print("\n=== Ollama model list ===")
print(run("docker exec tayyibt-ollama-1 ollama list 2>&1"))

print("\n=== AI service logs ===")
print(run("docker logs tayyibt-ai-service-1 --tail 15 2>&1"))

print("\n=== Test: health endpoint ===")
print(run("curl -sf http://localhost/ai/health 2>&1"))

print("\n=== Test: moderation endpoint ===")
print(run("""curl -sf -X POST http://localhost/ai/api/v1/moderate \
  -H 'Content-Type: application/json' \
  -d '{"content": "Assalamu Alaikum, excited to connect!", "content_type": "post"}' 2>&1"""))

print("\n=== Test: profile-tips endpoint ===")
print(run("""curl -sf -X POST http://localhost/ai/api/v1/profile-tips \
  -H 'Content-Type: application/json' \
  -d '{"profile": {"user_id": "test1", "age": 28, "gender": "male"}}' 2>&1"""))

c.close()