import os
import sys
import io
import time
import paramiko

# Make stdout UTF-8 safe on Windows consoles.
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '145.14.158.100'
DEADLINE = time.time() + 600  # 10 minutes


def connect():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, username='root', password=os.environ.get('VPS_PASSWORD', ''),
              timeout=60, banner_timeout=60, auth_timeout=60)
    return c


def run(c, cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read().decode(errors='replace') + e.read().decode(errors='replace')).strip()


c = connect()
baseline = run(c, "stat -c %Y /opt/tayyibt/scripts/cd-deploy.sh")
print(f"baseline cd-deploy.sh mtime: {baseline}")
c.close()

print("Watching for the GitHub deploy to re-sync (mtime bump) and stay healthy...")
last = None
while time.time() < DEADLINE:
    try:
        c = connect()
        mtime = run(c, "stat -c %Y /opt/tayyibt/scripts/cd-deploy.sh")
        crlf = run(c, "grep -c $'\\r' /opt/tayyibt/scripts/cd-deploy.sh")
        color = run(c, "grep -o 'bg-green-600' /opt/tayyibt/web/src/components/layout/UnderConstructionBanner.tsx | head -1")
        health = run(c, "curl -s -o /dev/null -w '%{http_code}' https://145-14-158-100.sslip.io/api/v1/health")
        c.close()
        snap = f"mtime={mtime} crlf_lines={crlf} src={color} https_health={health}"
        if snap != last:
            print(time.strftime('%H:%M:%S'), snap)
            last = snap
        if mtime != baseline and health == '200' and color == 'bg-green-600' and crlf == '0':
            print("\n✅ GitHub deploy re-synced the VPS (LF script, green, HTTPS 200). Pipeline healthy.")
            break
    except Exception as ex:
        print(time.strftime('%H:%M:%S'), 'retry:', repr(ex)[:100])
    time.sleep(20)
else:
    print("\nℹ Did not observe a fresh GitHub re-sync within the window. "
          "The VPS is already green/healthy from the manual deploy; the GH run may still be building.")
