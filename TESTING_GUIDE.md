# NutriStrive Phase 1A - Testing Guide

## 🚀 How to Run and Test the Application

### Prerequisites

Before running the app, ensure you have:
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli` or `npm install -g @expo/cli`)
- For iOS: Xcode and iOS Simulator (Mac only)
- For Android: Android Studio and Android Emulator
- Expo Go app on your physical device (optional)

---

## Option 1: Run on Physical Device (Easiest - Recommended)

This is the fastest way to test the app with full features including camera, sensors, and network switching.

### Steps:

1. **Install Expo Go on your phone:**
   - iOS: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: Download from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the mobile app:**
   ```bash
   cd mobile
   npm start
   ```

3. **Scan the QR code:**
   - iOS: Open Camera app and scan the QR code shown in terminal
   - Android: Open Expo Go app and scan the QR code

4. **The app will load on your device!**

### Testing on Physical Device:
- ✅ Camera works for food scanning
- ✅ Can toggle airplane mode to test offline functionality
- ✅ Real network conditions
- ✅ Haptic feedback works
- ✅ Notifications work
- ✅ All sensors available

---

## Option 2: Run on iOS Simulator (Mac Only)

### Steps:

1. **Open Xcode and start iOS Simulator:**
   ```bash
   open -a Simulator
   ```

2. **Start the mobile app for iOS:**
   ```bash
   cd mobile
   npm run ios
   ```

3. **The app will automatically install and launch in the simulator**

### Testing on iOS Simulator:
- ✅ Full UI testing
- ✅ Network requests
- ⚠️  Camera won't work (use Search mode instead)
- ⚠️  Limited sensor support

---

## Option 3: Run on Android Emulator

### Steps:

1. **Open Android Studio and start an emulator:**
   - Open Android Studio
   - Tools → Device Manager
   - Click "Play" on any virtual device

2. **Start the mobile app for Android:**
   ```bash
   cd mobile
   npm run android
   ```

3. **The app will automatically install and launch in the emulator**

### Testing on Android Emulator:
- ✅ Full UI testing
- ✅ Network requests
- ⚠️  Camera won't work (use Search mode instead)
- ⚠️  Limited sensor support

---

## Option 4: Run as Web App

The mobile app can also run in a web browser for quick testing of UI and logic.

### Steps:

1. **Start the web version:**
   ```bash
   cd mobile
   npm run web
   ```

2. **Open in browser:**
   - Automatically opens at http://localhost:8081
   - Or manually navigate to the URL shown in terminal

### Testing on Web:
- ✅ UI testing
- ✅ Navigation testing
- ⚠️  No camera
- ⚠️  No native features
- ⚠️  Limited mobile-specific functionality

---

## 🧪 Testing Checklist

### 1. Authentication Flow
- [ ] App loads and shows onboarding screen
- [ ] Can sign up with email and password
- [ ] Can sign in with existing account
- [ ] Auth state persists after closing and reopening app

### 2. Dashboard Screen
- [ ] Displays user's daily nutrition summary
- [ ] Shows calories, protein, carbs, fat
- [ ] Displays hydration status
- [ ] Shows recent workouts
- [ ] Pull to refresh updates data

### 3. Food Search & Logging (USDA Integration)
- [ ] Navigate to Build Plate screen
- [ ] Select "Search" mode
- [ ] Tap search bar to open USDA food search modal
- [ ] Search for "chicken breast" - should return results
- [ ] Select a food item to see details
- [ ] View complete nutrition breakdown
- [ ] Adjust portion size - nutrition updates
- [ ] Add food to current meal
- [ ] Add multiple foods to build a meal
- [ ] Log the complete meal

### 4. Camera Mode (Physical Device Only)
- [ ] Select "Camera" mode
- [ ] Grant camera permissions
- [ ] Take photo of food
- [ ] AI analyzes the food
- [ ] Results show detected foods with nutrition

### 5. Meal Optimization
- [ ] Build a meal with multiple foods
- [ ] Tap "Optimize" button
- [ ] AI suggests healthier alternatives
- [ ] Shows improvement score
- [ ] Can log optimized meal

### 6. Offline Mode Testing
- [ ] Enable airplane mode on device
- [ ] Try to log a meal
- [ ] Orange "offline" banner appears at top
- [ ] Meal is saved locally (check AsyncStorage)
- [ ] Disable airplane mode
- [ ] Orange banner changes to "X changes pending"
- [ ] Tap "Sync" button
- [ ] Changes upload to server
- [ ] Banner disappears when sync complete

### 7. Network Indicator
- [ ] Goes offline → Red banner appears
- [ ] Goes online with pending changes → Orange banner with count
- [ ] Taps sync → Shows progress percentage
- [ ] Success → Toast notification appears
- [ ] Banner disappears

### 8. Nutrition Screen
- [ ] View daily nutrition summary
- [ ] See calorie donut chart
- [ ] View meal history for the day
- [ ] Each meal shows foods and totals
- [ ] Can tap meals to edit (future feature)

### 9. Profile Screen
- [ ] View user profile information
- [ ] See nutrition targets
- [ ] Update profile details
- [ ] Changes save successfully

### 10. Performance
- [ ] App loads in under 3 seconds
- [ ] Smooth scrolling on all screens
- [ ] No lag when typing in search
- [ ] Images load progressively
- [ ] Network requests show loading states

---

## 🔧 Troubleshooting

### "Unable to connect to development server"
```bash
# Clear Metro cache and restart
cd mobile
rm -rf .expo
npx expo start --clear
```

### "Network request failed"
- Check that `.env` file has correct Supabase credentials
- Verify internet connection
- Check if backend API is running

### "Module not found" errors
```bash
cd mobile
rm -rf node_modules
npm install
```

### Camera not working
- Use Search mode instead on simulators
- Grant camera permissions on physical device
- Check app.json permissions

### Offline sync not working
- Check NetInfo package is installed: `@react-native-community/netinfo`
- Verify AsyncStorage is working
- Check Supabase connection

---

## 📱 Testing the USDA Food Database Integration

### What to Test:

1. **Search Accuracy:**
   - Search "apple" → Should return various apple types
   - Search "chicken breast" → Should return multiple options
   - Search "cheddar cheese" → Should show branded and generic

2. **Food Details:**
   - Select any food
   - Verify all nutrients display correctly
   - Change portion size to 200g
   - Verify nutrients double

3. **Caching:**
   - Search for "banana"
   - Close and reopen app
   - Search "banana" again
   - Should load faster (from cache)

4. **Offline Search:**
   - Search for several foods while online
   - Enable airplane mode
   - Search for previously searched foods
   - Should show cached results

---

## 🎯 Expected Results

### USDA Food Search:
- 600,000+ foods available
- Results appear within 1-2 seconds
- Frequently searched foods cached locally
- Offline access to cached foods

### Network & Sync:
- Offline indicator appears immediately when connection lost
- Pending changes tracked accurately
- Sync completes in under 5 seconds
- No data loss during offline periods

### Performance:
- 60 FPS scrolling
- < 3 second cold start
- < 1 second warm start
- Smooth animations

---

## 📊 Database Verification

### Check Supabase Dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Table Editor

### Verify Tables Created:
- ✅ users
- ✅ nutrition_targets
- ✅ usda_food_cache (should populate as you search)
- ✅ meals (should populate as you log meals)
- ✅ meal_foods
- ✅ workouts
- ✅ hydration_logs
- ✅ custom_foods
- ✅ recent_foods
- ✅ sync_queue (only has data when offline changes pending)

### Check Data Flow:
1. Log a meal in the app
2. Check `meals` table in Supabase → Should see new entry
3. Check `meal_foods` table → Should see food items
4. Search for a food
5. Check `usda_food_cache` → Should see cached food data

---

## 🐛 Known Limitations

1. **Camera mode requires physical device** - Won't work in simulators
2. **Some sensors unavailable in web version** - Use mobile for full features
3. **First USDA search is slower** - Subsequent searches use cache
4. **Offline mode requires prior online use** - Can't use app offline on first launch

---

## ✅ Success Criteria

The app is working correctly if:
- ✅ You can search and find foods from USDA database
- ✅ Food details show accurate nutrition information
- ✅ Meals are logged and appear in nutrition screen
- ✅ Offline indicator appears when connection is lost
- ✅ Pending changes sync when connection restored
- ✅ Navigation between screens is smooth
- ✅ Loading states appear during network requests
- ✅ No app crashes or errors

---

## 🆘 Need Help?

If you encounter issues:
1. Check error messages in the terminal
2. Look for red error screens in the app
3. Check network tab in browser dev tools (web version)
4. Verify Supabase credentials in `.env` file
5. Try clearing cache and reinstalling

---

**Ready to test? Start with Option 1 (Physical Device) for the best experience!**
