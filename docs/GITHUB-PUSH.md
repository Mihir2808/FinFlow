# Push FinFlow to GitHub (run after Git is installed)

Open a **new** PowerShell as yourself (after approving the Git installer UAC prompt), then:

```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

cd C:\Users\mihirk\Downloads\distributed-payment-platform-master\distributed-payment-platform-master

git --version
gh --version

# Login to GitHub (browser)
gh auth login

# Init + first commit
git init
git add .
git commit -m "feat: full-stack FinFlow payment platform with React UI and Docker Compose"

# Create public repo and push (change NAME if you want)
gh repo create finflow-distributed-payment-platform --public --source=. --remote=origin --push --description "Full-stack distributed payment platform: Spring Boot microservices, Kafka saga, transactional outbox, React dashboard"
```

Then:
1. Record Loom → [docs/LOOM-SCRIPT.md](LOOM-SCRIPT.md)
2. Deploy UI → [docs/VERCEL.md](VERCEL.md)
3. Paste Loom + Vercel URLs into README “Live demo” table
