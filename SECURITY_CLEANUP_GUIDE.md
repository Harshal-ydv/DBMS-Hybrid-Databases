# 🔒 SECURITY CLEANUP GUIDE
## Before Uploading to Public Google Drive

### ⚠️ CRITICAL: Files to Modify/Remove

---

## 1. ❌ DELETE THIS FILE COMPLETELY
```
backend/.env
```
**Action:** DELETE the entire `.env` file before uploading

**Why:** Contains actual passwords and connection strings to your AWS RDS and MongoDB

**What's exposed:**
- MySQL password: `harshalyadav123`
- AWS RDS endpoint: `food-delivery-db.chcisgcswz7m.ap-south-1.rds.amazonaws.com`
- MongoDB connection string with password

---

## 2. ✅ KEEP THIS FILE (Already Safe)
```
backend/.env.example
```
**This file is SAFE** - it only shows the format without actual credentials

---

## 3. 🔐 RECOMMENDED: Change Your Actual Passwords

After uploading to public drive, **CHANGE THESE PASSWORDS** in your actual AWS/MongoDB accounts:

### AWS RDS MySQL Database:
- Current username: `admin`
- Current password: `harshalyadav123`
- Endpoint: `food-delivery-db.chcisgcswz7m.ap-south-1.rds.amazonaws.com`

**Action:** 
1. Go to AWS RDS Console
2. Modify master password
3. Choose a strong new password

### MongoDB Atlas:
- Current connection string contains: `harshalyadav123`

**Action:**
1. Go to MongoDB Atlas
2. Database Access → Edit User
3. Change password

---

## 4. 📋 CHECKLIST BEFORE UPLOAD

- [ ] Delete `backend/.env` file
- [ ] Verify `.env.example` exists (template only)
- [ ] Check `.gitignore` includes `.env`
- [ ] Verify no hardcoded credentials in `.js` files (✅ Already clean)
- [ ] Remove any personal API keys or tokens
- [ ] After upload, change your actual AWS RDS password
- [ ] After upload, change your MongoDB Atlas password

---

## 5. 🛡️ FILES THAT ARE SAFE (No Changes Needed)

All these files only reference `process.env.*` variables (safe):
- ✅ `backend/config/env.js`
- ✅ `backend/config/database.js`
- ✅ All files in `backend/scripts/`
- ✅ All files in `backend/models/`
- ✅ All files in `backend/controllers/`
- ✅ Frontend files (no backend credentials)

---

## 6. 📝 WHAT TO TELL YOUR TEACHER

Include this note in your project:

```
SETUP INSTRUCTIONS:

1. Copy backend/.env.example to backend/.env
2. Fill in your own database credentials:
   - MySQL database (AWS RDS or local)
   - MongoDB connection string (Atlas or local)
3. Run: npm install (in both backend and frontend folders)
4. Run: node backend/scripts/init-database.js (setup MySQL schema)
5. Run: node backend/scripts/seed.js (add sample data)
6. Start backend: cd backend && node server.js
7. Start frontend: cd frontend && npm start

Note: Actual credentials are not included for security reasons.
```

---

## 7. 🚀 QUICK CLEANUP COMMANDS

Run these commands before uploading:

```bash
# Navigate to project folder
cd "c:\Users\harsh_cuhj7z7\Downloads\DBMS mini project"

# Delete the .env file
Remove-Item "backend\.env" -Force

# Verify it's deleted
Test-Path "backend\.env"  # Should return False
```

---

## 8. ⚡ ALTERNATIVE: Create a Clean Copy

Instead of modifying, create a clean copy for upload:

```bash
# Copy entire project to a new folder
Copy-Item -Path "c:\Users\harsh_cuhj7z7\Downloads\DBMS mini project" -Destination "c:\Users\harsh_cuhj7z7\Downloads\DBMS mini project - UPLOAD" -Recurse

# Delete .env from the copy
Remove-Item "c:\Users\harsh_cuhj7z7\Downloads\DBMS mini project - UPLOAD\backend\.env" -Force

# Verify
Test-Path "c:\Users\harsh_cuhj7z7\Downloads\DBMS mini project - UPLOAD\backend\.env"
```

This way you keep your working version with credentials!

---

## 9. 🔍 FINAL VERIFICATION

Before uploading, manually check:

1. ✅ No `.env` file in backend folder
2. ✅ `.env.example` exists (safe template)
3. ✅ No files with your actual passwords visible
4. ✅ README or instructions mention "add your own credentials"

---

## 10. 🌐 AFTER UPLOADING - CRITICAL

**IMMEDIATELY CHANGE YOUR PASSWORDS:**

1. **AWS RDS:**
   - Go to: https://console.aws.amazon.com/rds/
   - Select your database
   - Modify → Change master password

2. **MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com/
   - Database Access → Edit user
   - Change password

**Why:** Even though you deleted `.env`, someone might have seen it or cached it. Better safe than sorry!

---

## ✅ SUMMARY

**DELETE:**
- `backend/.env` (entire file)

**KEEP:**
- `backend/.env.example` (safe template)
- Everything else is safe

**CHANGE AFTER UPLOAD:**
- AWS RDS password
- MongoDB Atlas password

---

**Good practice for submission!** 🎓
