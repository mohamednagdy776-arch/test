import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

print("=== VPS hostname ===")
print(run("hostname -f"))

print("\n=== Reverse DNS (PTR) ===")
print(run("dig -x 145.14.158.100 +short 2>/dev/null || nslookup 145.14.158.100 | tail -3"))

print("\n=== Forward DNS check for srv1726898.hstgr.cloud ===")
result = run("dig +short srv1726898.hstgr.cloud A 2>/dev/null || nslookup srv1726898.hstgr.cloud | grep Address | tail -1")
print(result)
if "145.14.158.100" in result:
    print(">>> hostname resolves correctly to 145.14.158.100 — Let's Encrypt is possible!")
else:
    print(">>> hostname does NOT resolve to the VPS IP")

print("\n=== /etc/hosts ===")
print(run("cat /etc/hosts"))

c.close()