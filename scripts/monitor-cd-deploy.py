import os
import time
import paramiko

HOST = '145.14.158.100'
DEADLINE = time.time() + 720  # up to 12 minutes for build+restart


def connect():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, username='root', password=os.environ.get('VPS_PASSWORD', ''),
              timeout=60, banner_timeout=60, auth_timeout=60)
    return c


def run(c, cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read().decode() + e.read().decode()).strip()


last = None
while time.time() < DEADLINE:
    try:
        c = connect()
        dup = run(c, "test -e /opt/tayyibt/web/src/components/layout/underconstarctionsbanner.tsx "
                     "&& echo PRESENT || echo GONE")
        color = run(c, "grep -o 'bg-\\(green\\|blue\\|red\\)-600' "
                       "/opt/tayyibt/web/src/components/layout/UnderConstructionBanner.tsx | head -1")
        web = run(c, "docker ps --filter name=web --format '{{.Status}}' | head -1")
        health = run(c, "curl -s -o /dev/null -w '%{http_code}' http://localhost/api/v1/health")
        # Look inside the RUNNING web container's build for the green class.
        served = run(c, "docker exec $(docker ps -qf name=web | head -1) sh -c "
                        "\"grep -rl 'bg-green-600' /app/.next 2>/dev/null | head -1\" 2>/dev/null")
        snap = f"dup={dup} src={color} web='{web}' health={health} green_in_build={'yes' if served else 'no'}"
        if snap != last:
            print(time.strftime('%H:%M:%S'), snap)
            last = snap
        c.close()
        if dup == 'GONE' and color == 'bg-green-600' and health == '200' and served:
            print("\n✅ DEPLOY VERIFIED: duplicate removed by rsync --delete, active banner green, site healthy & serving green build.")
            break
    except Exception as ex:
        print(time.strftime('%H:%M:%S'), 'retry:', repr(ex)[:120])
    time.sleep(25)
else:
    print("\n⚠ Timed out waiting for the deploy to fully converge — last state above.")
