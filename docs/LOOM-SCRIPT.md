# Demo recording script (Loom — ~2 minutes)

Record with [Loom](https://www.loom.com/) while Docker stack is running (`http://localhost:3001`).

## Script

1. **(0:00–0:15) Hook**  
   “This is FinFlow — a full-stack distributed payment platform with Spring microservices, Kafka saga, and a React dashboard.”

2. **(0:15–0:35) Architecture glance**  
   Show README architecture diagram briefly.  
   “Traffic hits an API gateway with JWT. Payments go through wallet locking, fraud review on Kafka, then settle and credit.”

3. **(0:35–1:10) Happy path**  
   - Register User A → create wallet (5000 BRL)  
   - Incognito: Register User B → create wallet → copy user id  
   - As A: send 100 BRL → show saga timeline → APPROVED  
   - Show User B balance increased

4. **(1:10–1:35) Failure path**  
   Send 50,001 BRL → REJECTED → reserved funds released

5. **(1:35–2:00) Close**  
   Open Kafka UI or mention outbox / idempotency briefly.  
   “Repo is public on GitHub — one-command Docker Compose demo.”

## After recording

1. Copy the Loom share URL  
2. Paste it into the README “Live demo” section  
3. Add the same link to your LinkedIn / resume project bullet
