Make thing-ping.service in /etc/systemd/system

---
https://stackoverflow.com/questions/4018154/how-do-i-run-a-node-js-app-as-a-background-service

Note if you're new to Unix: /var/www/myapp/app.js should have #!/usr/bin/env node on the very first line and have the executable mode turned on chmod +x myapp.js.

Copy your service file into the /etc/systemd/system.

Start it with systemctl start myapp.

Enable it to run on boot with systemctl enable myapp.

See logs with journalctl -u myapp

---




---

[Unit]
Description=Thing-Ping
After=mysqld.service

[Service]
ExecStart=/var/www/thing-discord/thing-ping.js
#Restart=on-failure
Restart=on-failure
RestartSec=10
User=nobody
# Note Debian/Ubuntu uses 'nogroup', RHEL/Fedora uses 'nobody'
Group=nogroup
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/var/www/thing-ping

[Install]
WantedBy=multi-user.target

---

watch -d 'nmcli -t -f CHAN device wifi | sort | uniq -c | sort -rn'

