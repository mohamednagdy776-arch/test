import os
import paramiko, time
APP="/opt/tayyibt"; ENV=f"{APP}/.env.production"
COMPOSE=f"docker compose -f {APP}/docker-compose.vps.yml --env-file {ENV}"
c=paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100',username='root',password=os.environ.get('VPS_PASSWORD',''),timeout=40,banner_timeout=40,auth_timeout=40)
def run(cmd,t=300):
    print(f"$ {cmd[:90]}")
    _,o,_=c.exec_command(cmd,get_pty=True,timeout=t)
    for line in o:
        l=line.rstrip()
        if l: print(f"  {l}")
    o.channel.recv_exit_status()
run(f"cd {APP} && {COMPOSE} up -d --no-deps --force-recreate web 2>&1")
time.sleep(15)
run('docker ps --format "table {{.Names}}\t{{.Status}}" | grep web')
run("curl -s https://145-14-158-100.sslip.io/terms | grep -o 'شروط الخدمة' | head -1")
c.close()