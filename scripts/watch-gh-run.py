import sys
import io
import time
import json
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

REPO = "mohamednagdy776-arch/test"
SHA = sys.argv[1] if len(sys.argv) > 1 else None
DEADLINE = time.time() + 720


def api(path):
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}{path}",
                                 headers={"Accept": "application/vnd.github+json",
                                          "User-Agent": "deploy-watch"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


print(f"Watching deploy.yml runs for sha={SHA}")
run = None
# Wait for the run for our sha to appear.
while time.time() < DEADLINE and run is None:
    data = api("/actions/workflows/deploy.yml/runs?per_page=10")
    for r in data.get("workflow_runs", []):
        if SHA is None or r["head_sha"] == SHA:
            run = r
            break
    if run is None:
        print(time.strftime('%H:%M:%S'), "run not queued yet...")
        time.sleep(12)

if run is None:
    print("No run found for sha within window.")
    sys.exit(2)

run_id = run["id"]
print(f"Found run {run_id}: {run['html_url']}")

last = None
while time.time() < DEADLINE:
    r = api(f"/actions/runs/{run_id}")
    status, concl = r["status"], r["conclusion"]
    if (status, concl) != last:
        print(time.strftime('%H:%M:%S'), f"status={status} conclusion={concl}")
        last = (status, concl)
    if status == "completed":
        print()
        if concl == "success":
            print("✅ GitHub deploy SUCCEEDED end-to-end.")
        else:
            print(f"❌ GitHub deploy {concl}. Per-step breakdown:")
            jobs = api(f"/actions/runs/{run_id}/jobs")
            for j in jobs.get("jobs", []):
                for s in j.get("steps", []):
                    mark = {"success": "✓", "skipped": "·", "failure": "✗"}.get(s["conclusion"], "?")
                    print(f"   {mark} {s['number']:>2} {s['name']} [{s['conclusion']}]")
        sys.exit(0 if concl == "success" else 1)
    time.sleep(15)

print("Timed out waiting for run to complete.")
sys.exit(2)
