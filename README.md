# 📃 SIKOMA
Repository ini sudah diinstalasi pada main branch dengan pengaturan berikut :

## ⚙️ Setup Backend 
`npm init -y`  

## 💡 Setup Frontend
`npm install create vite@latest`  
<br>

---
## 📕 Cara Memulai Collab Repository 
### 1. Pergi ke direktori folder yang diinginkan
`cd folderUntukClone`
### 2. Clone Repository
`git clone https://github.com/CahKangkung/SIKOMA.git`
### 3. Masuk folder SikomaApp
`cd SikomaApp`
### 4. Instalasi package backend 
- `cd backend`
- `npm install`
### 5. Instalasi package frontend
- `cd frontend`
- `npm install`
<br>

---
## ⚠️ Peringatan & Saran Penggunaan
### 1. Setiap kali ingin membuat perubahan disarankan untuk menginformasikan semua anggota
### 2. Mengedit file yang bersamaan dapat menyebabkan conflict
### 3. Jika sudah selesai membuat perubahan bisa diinformasikan ke semua anggota untuk melakukan pull
### 4. Disarankan untuk membuat sebuah branch ketika ingin membuat perubahan
<br>

---
## 🛠️ Tips / Command Dalam Git
> [!NOTE]
> Main/Master Branch
### 1. Mengupload perubahan pada main branch
- `git add .`
- `git commit -m "Isi tentang perubahan yang anda buat"`
- `git push origin main`
### 2. Mengambil/menerapkan perubahan dari pihak lain di main branch
`git pull origin main`  
<br>

> [!NOTE]
> Another Branch
### 1. Memeriksa branch yang ada
`git branch`
### 2. Membuat sebuah branch baru
`git checkout -b namabranch` atau `git switch -c namabranch`
### 3. Berpindah ke branch lain
`git checkout namabranch` atau `git switch namabranch`
### 4. Upload perubahan ke branch lain
- Posisi harus berada di branch tersebut
- `git add .`
- `git commit -m "Isi perubahannya"`
- `git push origin namabranch`
### 5. Mengambil perubahan dari pihak lain ke lokal
- `git fetch origin` melihat branch yang tersedia
- `git checkout -t origin/namabranch` melacak dan membuat branch tersebut
- `git pull`
### 6. Melakukan merge branch lain menjadi satu di main branch
- Posisi harus berada di branch main
- `git merge namabranch`
- `git push origin main`

