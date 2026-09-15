# Sentinel & Infrastructure | Discord Automation Ecosystem

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Persistence-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

A multi-tiered automation suite designed for enterprise-grade community management and infrastructure monitoring. This ecosystem bridges the gap between community engagement and systems administration, featuring a flagship moderation framework and dedicated DevOps utilities.

---

# Sentinel Core
**Sentinel Core** is the primary engine of the ecosystem. It is a stateful, event-driven framework engineered for high-traffic environments where security and reliability are paramount.

### Heuristic Auto-Moderation Engine
Sentinel utilizes a multi-layered analysis pipeline to protect the community from raids and toxicity:
*   **String Normalization:** Content is passed through a `removeSymbols()` utility to strip obfuscation characters (e.g., `!@#`) before being cross-referenced against complex Regex patterns.
*   **Stateful Anti-Spam:** Employs a `Map`-based memory cache to monitor user frequency. If a user exceeds 3 messages in 7 seconds, the bot executes an immediate 1-minute timeout and retroactively purges the spam from the channel.
*   **Escalation Logic:** Violations are tracked via MongoDB. Three triggers within a rolling hour automatically escalate penalties and dispatch high-priority staff alerts.

### Zero-Trust Security & Verification
*   **Dynamic Captcha:** New members must solve high-contrast image puzzles generated via `captcha-canvas` and submit answers through secure Discord Modals.
*   **Alt-Account Detection:** Integrates a suspicion-scoring algorithm that audits account age, badges, and metadata to flag potential burner accounts for manual staff review.

### Reliability & Performance Monitoring
*   **One-Message Dashboard:** Sentinel monitors its own health (CPU, RAM, V8 Heap usage, and API Latency). To maintain a clean UI, it finds its previous status report and edits it in real-time every 60 seconds.
*   **Global Error Interceptor:** A centralized handler catches unhandled exceptions and promise rejections, formatting the stack trace and performance context into a Webhook-delivered "Crash Report" for immediate developer triage.

---

# Infrastructure & Utility Modules
While Sentinel manages the community, these specialized nodes handle technical infrastructure tasks:

### IPRelay (Network Monitor)
A critical utility for self-hosted homelab environments with dynamic public IPs.
*   **Logic:** Queries external IP providers every 5 minutes.
*   **Action:** If a change is detected, it dispatches an urgent Webhook alert to notify administrators that remote services (Cloudflare Tunnels, VPNs) may require re-syncing.

### BackupNotifier (DevOps Auditor)
Bridges server-side redundancy with Discord-based visibility.
*   **SFTP Integration:** Connects to remote storage via `ssh2-sftp-client` to verify that `eBackup` plugins have successfully written files.
*   **Cleanup:** Automatically deletes local files older than 48 hours while maintaining a persistent audit log of all off-site transfers.

### CLB Lofi (Media Node)
A resource-optimized audio streamer designed for 24/7 background audio.
*   **Audio Pipeline:** Utilizes `@discordjs/voice` to stream local high-quality `.mp3` assets.
*   **Alone-Check:** Automatically disconnects from voice channels when empty to minimize server-side resource consumption.

---

# Technical Architecture

Every bot in this ecosystem follows a standardized **Professional Pattern**:

```text
.
├── src
│   ├── handlers/      # Bootloaders for Commands and Events
│   ├── events/        # Async listeners (Performance, Audit, Logic)
│   ├── commands/      # Slash Command Registry
│   ├── Schemas/       # Mongoose Data Models
│   └── utils/         # Global Error Handlers & API Helpers
└── bot.js             # Entry Point
```

---

# Tech Stack
| Component | Technology |
| :--- | :--- |
| **Runtime** | Node.js 18+ (ESM/CommonJS) |
| **Persistence** | MongoDB & Mongoose ODM |
| **Security** | Regex Heuristics, Captcha-Canvas |
| **Monitoring** | systeminformation, V8 Statistics, Axios |
| **Communication** | SSH2 (SFTP), HTTP/REST |

---

# Deployment & Configuration

1.  **Dependencies:** Run `npm install` in the root of the desired module.
2.  **Environment:** Configure the `.env` based on the provided examples:
    ```env
    TOKEN=your_bot_token
    MONGO_URL=your_mongodb_srv
    STAFF_CHANNEL_ID=logging_channel
    PERFORMANCE_WEBHOOK_URL=monitoring_webhook
    ```
3.  **Launch:**
    ```bash
    # Start Sentinel Core
    node Bots/sentinel-prod/bot.js
    
    # Start Infrastructure Monitor
    node Bots/IPRelay/index.js
    ```

---

# License & Maintainer
Distributed under the **MIT License**.

**Maintainer:** *ChefAmbrosia* – Backend & Infrastructure Developer