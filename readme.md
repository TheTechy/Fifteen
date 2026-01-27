# Fifteen 🎯
**15 Micro-Objectives. 1 Day. Get it Done.**

Fifteen is a minimalist Chrome Extension designed to fight "To-Do List Fatigue." By enforcing a hard limit of 15 tasks and providing integrated time-boxing tools, it helps you focus on what actually matters today.

---

## 🚀 Getting Started

### 1. Installation (Developer Mode)
Since Fifteen is your custom creation, you can load it directly into Chrome:
1. Open Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer Mode** (top right corner).
3. Click **Load Unpacked**.
4. Select the folder containing your project files.
5. Pin **Fifteen** to your browser bar for instant access.

### 2. The Methodology
* **Choose Wisely:** You only have 15 slots. If you want to add a 16th, you must delete or finish an existing one.
* **Time-Box:** Use the hourly buttons to set a Chrome Alarm. A notification will alert you when your time is up.
* **Filter & Find:** Use the search bar to instantly isolate tasks by name, `#tag`, or `priority`.
* **Prioritize:** Drag and drop tasks to organize your day’s flow (Morning -> Afternoon -> Evening).

---

## 🛠 Features
- **Smart Filtering:** Search through titles, tags, and priorities in real-time.
- **Background Persistence:** Timers run via Chrome Alarms API—they don't stop even if you close the popup.
- **Inline Editing:** Click any task text to rename it on the fly.
- **Keyboard Optimized:** `Enter` to add, `Tab` to navigate. No mouse required for data entry.
- **Local Storage:** Your data stays on your machine, synced to your Chrome profile.

---

## 📂 Project Structure
- `manifest.json` - Extension configuration and permissions.
- `popup.html` - The structural skeleton of the app.
- `style.css` - The "Fifteen" aesthetic (Pastels & Pills).
- `popup.js` - Core logic, filtering, and UI updates.
- `background.js` - The Service Worker handling background alarms.
- `js/sortable.min.js` - Drag-and-drop engine.

---

## 🎨 Credits
Designed with a focus on minimalism and cognitive ease. Powered by Chrome Extension Manifest V3.