# คู่มือ: การเข้าถึง SSH บน Debian 13 ผ่าน Cloudflare Tunnel (ไม่ต้อง Forward Port)

การใช้ Cloudflare Tunnel ช่วยให้คุณเข้าถึงเซิร์ฟเวอร์ในวง LAN จากอินเทอร์เน็ตได้โดยไม่ต้องทำ Port Forwarding บน Router และยังได้รับความปลอดภัยจากการกรอง Traffic ของ Cloudflare อีกด้วย

> **หมายเหตุ:** คำสั่งทั้งหมดในคู่มือนี้รันในฐานะ **root** หากใช้ user ปกติ ให้เติม `sudo` นำหน้าทุกคำสั่ง

---

## 1. เตรียมความพร้อม: ติดตั้งเครื่องมือพื้นฐาน และตั้งค่าระบบ

อัปเดตระบบ ติดตั้งเครื่องมือจัดการพื้นฐาน พร้อมทั้งตั้งค่าภาษาไทยและโซนเวลาให้ถูกต้อง

```bash
# 1.1 อัปเดตรายชื่อแพ็กเกจ
apt update && apt upgrade -y

# 1.2 ติดตั้งเครื่องมือที่จำเป็น รวมถึง Locale และ Timezone
apt install -y sudo openssh-server vim-tiny procps htop iputils-ping \
  net-tools wget lynx unzip rsync iw git curl gnupg2 software-properties-common \
  locales tzdata fonts-tlwg-laksaman

# 1.3 ตั้งค่า Locale ภาษาไทย และ Timezone (Asia/Bangkok)
sed -i 's/# th_TH.UTF-8 UTF-8/th_TH.UTF-8 UTF-8/' /etc/locale.gen
locale-gen
ln -fs /usr/share/zoneinfo/Asia/Bangkok /etc/localtime
echo "Asia/Bangkok" | tee /etc/timezone
dpkg-reconfigure -f noninteractive tzdata

# 1.4 เพิ่ม Alias 'v' สำหรับดูรายการไฟล์ (Global)
echo "alias v='ls -al'" | tee -a /etc/bash.bashrc

# 1.5 เปิดใช้งาน SSH
systemctl enable --now ssh
```

---

## 2. การจัดการผู้ใช้ (User Management)

สร้างผู้ใช้ใหม่ตามโครงสร้างที่กำหนด (UID 1000 สำหรับ `pi` และ UID 1001 สำหรับ `admin`)

```bash
# 1. สร้าง user: pi (ID 1000)
useradd -m -u 1000 -s /bin/bash pi
echo "pi:xxxxx" | chpasswd

# 2. สร้าง user: admin (ID 1001)
useradd -m -u 1001 -s /bin/bash admin
echo "admin:xxxx" | chpasswd

# เพิ่มทั้งสอง user เข้ากลุ่ม sudo เพื่อให้มีสิทธิ์จัดการระบบ
usermod -aG sudo pi
usermod -aG sudo admin
```

---

## 3. การติดตั้ง Docker

ติดตั้ง Docker Engine และ Docker Compose Plugin เพื่อรองรับการใช้งาน Container

```bash
# เพิ่ม Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# เพิ่ม Repository เข้าไปที่ Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# ติดตั้ง Docker packages
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# (แนะนำ) เพิ่ม user เข้ากลุ่ม docker เพื่อให้ใช้งานได้โดยไม่ต้อง root
usermod -aG docker pi
usermod -aG docker admin
```

---

## 4. การตั้งค่า Network (Static IP)

สำหรับ Debian 13 แนะนำให้ใช้ NetworkManager (`nmcli`) เพื่อให้ IP ภายในวง LAN คงที่

```bash
# ตรวจสอบชื่อ Interface (เช่น eth0 หรือ enp0s3)
nmcli device

# ตั้งค่า IP (ตัวอย่าง: 192.168.1.251)
nmcli con mod "Wired connection 1" \
  ipv4.addresses 192.168.1.251/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "1.1.1.1,8.8.8.8" \
  ipv4.method manual

nmcli con up "Wired connection 1"
```

---

## 5. ติดตั้งและตั้งค่า Cloudflare Tunnel (`cloudflared`)

### ขั้นตอนการติดตั้ง

```bash
# เพิ่ม Repository ของ Cloudflare
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared bookworm main" | \
  tee /etc/apt/sources.list.d/cloudflared.list

apt update && apt install cloudflared -y
```

> **หมายเหตุ Debian 13 (Trixie):** ณ ปัจจุบัน Cloudflare ยังไม่มี repo สำหรับ `trixie` โดยเฉพาะ จึงต้องใช้ repo ของ `bookworm` แทน (ซึ่งใช้งานได้ปกติ) ห้ามใช้ `$(lsb_release -cs)` หรือ `$VERSION_CODENAME` เพราะจะได้ค่า `trixie` ซึ่งจะหา repo ไม่เจอ

### ขั้นตอนการสร้าง Tunnel (CLI)

**Login:**

```bash
cloudflared tunnel login
```

**สร้าง Tunnel:**

```bash
cloudflared tunnel create icbserv-ssh
```

**ผูกโดเมน (DNS Route):**

```bash
cloudflared tunnel route dns icbserv-ssh icbserv.thaidirection.com
```

**สร้างไฟล์คอนฟิก** (`/etc/cloudflared/config.yml`):

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: icbserv.thaidirection.com
    service: ssh://localhost:22
  - service: http_status:404
```

**ติดตั้งเป็น Service:**

```bash
cloudflared service install
systemctl enable --now cloudflared
```

---

## 6. ฝั่ง Client: วิธีการเชื่อมต่อ

ติดตั้ง `cloudflared` บนเครื่องที่คุณใช้รีโมท จากนั้นเชื่อมต่อด้วยคำสั่ง:

```bash
ssh -o ProxyCommand="cloudflared access ssh --hostname icbserv.thaidirection.com" pi@icbserv.thaidirection.com
# หรือ
ssh -o ProxyCommand="cloudflared access ssh --hostname icbserv.thaidirection.com" admin@icbserv.thaidirection.com
```

---

## 7. การเสริมความปลอดภัย (Hardening)

### ปรับแต่ง SSH Config

แก้ไขไฟล์ `/etc/ssh/sshd_config`:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers pi admin  # จำกัดให้เฉพาะ pi และ admin เท่านั้นที่เข้าได้
```

รัน `systemctl restart ssh` เพื่อใช้งานค่าใหม่

### ติดตั้ง Fail2Ban

```bash
apt install fail2ban -y
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable --now fail2ban
```

---

## สรุป

ตอนนี้เซิร์ฟเวอร์ของคุณมีทั้ง Docker สำหรับรันแอปพลิเคชัน และ Cloudflare Tunnel สำหรับการรีโมทจากภายนอกอย่างปลอดภัยครับ
