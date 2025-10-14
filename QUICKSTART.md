# 🚀 Quick Start Guide

## Run the App in 3 Steps

### 1️⃣ Navigate to mobile folder
```bash
cd mobile
```

### 2️⃣ Install dependencies (first time only)
```bash
npm install
```

### 3️⃣ Start the app
```bash
npm start
```

---

## What Happens Next?

A QR code will appear in your terminal with a menu:

```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor
```

---

## 📱 Choose Your Testing Method

### **Method A: Phone (Best Experience)**
1. **Install Expo Go:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan QR code:**
   - iOS: Use Camera app
   - Android: Use Expo Go app scanner

3. **App loads on your phone!** 🎉

### **Method B: Web Browser (Quick Test)**
- Press `w` in the terminal
- Browser opens automatically
- ⚠️ Limited features (no camera, offline mode)

### **Method C: iOS Simulator (Mac Only)**
- Press `i` in the terminal
- Simulator opens automatically
- ⚠️ No camera support

### **Method D: Android Emulator**
- Start Android Studio emulator first
- Press `a` in the terminal
- ⚠️ No camera support

---

## ✅ What to Test

### 1. Food Search (Main Feature)
```
Open app → "Build Plate" tab → "Search" mode → Search any food
```

Try searching:
- "chicken breast"
- "banana"
- "brown rice"
- "cheddar cheese"

Should see results from 600,000+ USDA foods!

### 2. Add Food to Meal
```
Search food → Tap result → Adjust portion → Add to meal
```

### 3. Offline Mode
```
Enable airplane mode → Log meal → See orange banner → Disable airplane mode → Tap "Sync"
```

### 4. Navigation
- **Dashboard** - Daily summary
- **Build Plate** - Food search & meal builder
- **Nutrition** - Food diary
- **Workouts** - Exercise tracking
- **Profile** - User settings

---

## 🐛 Troubleshooting

### Can't start the server?
```bash
# Clear cache and restart
npx expo start --clear
```

### Module not found errors?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Connection issues?
- Check WiFi connection
- Verify `.env` file has Supabase credentials
- Try restarting the server

---

## 📦 What's Built

✅ **USDA Food Database Integration**
- 600,000+ foods searchable
- Complete nutrition data
- Smart caching system

✅ **Offline Support**
- Works without internet
- Auto-sync when online
- Network status indicator

✅ **Database (Supabase)**
- User profiles
- Meal logging
- Food cache
- Workout tracking
- Hydration logs

✅ **Mobile App**
- React Native + Expo
- 5 main screens
- Camera food scanning
- AI meal optimization

---

## 🎯 Success = App Opens and You Can Search Foods

If you can:
1. Open the app
2. Navigate to Build Plate
3. Search for "chicken"
4. See results from USDA database

**You're all set! The core functionality is working.** 🎉

---

## 📚 More Details

See `TESTING_GUIDE.md` for comprehensive testing instructions.

---

**Ready? Run: `cd mobile && npm install && npm start`**
