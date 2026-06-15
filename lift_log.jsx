import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Check, ChevronDown, ChevronUp, Flame, History, AlertCircle, Trash2, 
  Dumbbell, Scale, Brain, Upload, X, Download, Copy, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const PLAN_START = new Date('2026-05-25T00:00:00');
const MAX_BMI_IMAGES = 15;

const WORKOUT_PLAN = {
  Mon: {
    title: 'PUSH',
    focus: 'Chest / Shoulders / Triceps',
    warmup: '3 min treadmill, arm circles + band pull-aparts, then 2 light sets of incline bench at ~40%.',
    exercises: [
      { name: 'Incline BB Press', reps: '6-10', sets: 3, isCompound: true, note: 'Main chest lift. Brief pause at bottom. Drive progression here.' },
      { name: 'Flat DB Press', reps: '8-12', sets: 3 },
      { name: 'Seated DB Overhead Press', reps: '8-12', sets: 3, isCompound: true },
      { name: 'Cable Mid Chest Fly', reps: '12-15', sets: 3 },
      { name: 'Lateral Raise', reps: '12-20', sets: 3, note: 'Strict form, no swinging.' },
      { name: 'Rope Tricep Pushdown', reps: '10-15', sets: 3 },
      { name: 'Overhead Cable Tricep Ext', reps: '12-15', sets: 3 },
    ],
  },
  Wed: {
    title: 'PULL',
    focus: 'Back / Biceps',
    warmup: '3 min treadmill, band pull-aparts, 1 min dead hang, then 2 light sets of lat pulldown.',
    exercises: [
      { name: 'Lat Pulldown (wide)', reps: '8-12', sets: 3, isCompound: true },
      { name: 'Barbell Row OR Chest-Supported Row', reps: '8-12', sets: 3, isCompound: true, note: 'Pick one and stick with it for the cycle.' },
      { name: 'Cable Seated Row (close grip)', reps: '10-12', sets: 3 },
      { name: 'Face Pulls', reps: '15-20', sets: 3, note: "Rear delt + upper back health. Don't skip." },
      { name: 'EZ Bar Curl', reps: '8-12', sets: 3 },
      { name: 'Incline DB Curl', reps: '10-12', sets: 3 },
      { name: 'Hammer Curl', reps: '12-15', sets: 3 },
    ],
  },
  Fri: {
    title: 'LEGS',
    focus: 'Full lower body — quads + posterior',
    warmup: '5 min treadmill, leg swings, bodyweight squats, then 2 light sets of squat or hack squat.',
    exercises: [
      { name: 'Back Squat OR Hack Squat', reps: '6-10', sets: 3, isCompound: true, note: 'Pick one and stick with it for the cycle.' },
      { name: 'Romanian Deadlift', reps: '8-12', sets: 3, isCompound: true, note: 'Hinge focus, light knee bend, feel the hamstrings stretch.' },
      { name: 'Leg Press', reps: '10-15', sets: 3 },
      { name: 'Lying Leg Curl', reps: '10-15', sets: 3 },
      { name: 'Walking Lunges', reps: '12/leg', sets: 3 },
      { name: 'Standing Calf Raise', reps: '10-15', sets: 3 },
      { name: 'Hanging Leg Raise', reps: 'AMRAP', sets: 3 },
    ],
  },
};

const DAYS_ORDER = ['Mon', 'Wed', 'Fri'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DIET_PLAN = {
  Mon: {
    type: 'Push Day · Non-Veg',
    meals: [
      { time: '7:30 AM', type: 'PRE-BREAKFAST', item: '2 boiled eggs + black coffee (no sugar)', qty: '2 eggs', kcal: 140, p: 12, c: 0, f: 10, direction: 'Boil eggs in bubbling water for 7-8 minutes (medium) or 10 minutes (hard). Brew black coffee without sugar.' },
      { time: '9:00 AM', type: 'BREAKFAST', item: 'Overnight oats with skyr, milk, whey protein', qty: '40g oats · 150g skyr · 150ml milk · 1 scoop whey', kcal: 415, p: 49, c: 42, f: 9, direction: 'Mix oats, skyr, milk, and whey in a jar or bowl. Stir thoroughly, cover, and refrigerate overnight.' },
      { time: '1:30 PM', type: 'LUNCH', item: 'Chapati + Dal + Chicken curry + Sabzi', qty: '2 small chapati · 1 katori dal · 100-120g chicken · 1 katori sabzi · 1 tsp ghee max', kcal: 600, p: 45, c: 60, f: 18, direction: 'Reheat dal, sabzi, and chicken curry. Serve warm with 2 small chapatis. Keep ghee addition strictly below 1 tsp.' },
      { time: '7:00 PM', type: 'PRE-WORKOUT', item: 'Roasted chana + small banana', qty: '40g chana · 1 banana', kcal: 235, p: 10, c: 45, f: 4, direction: 'Portion 40g roasted chana and peel banana. Eat 45-60 mins before working out for optimal energy.' },
      { time: '9:15 PM', type: 'POST-WORKOUT', item: 'Whey protein + banana in water', qty: '1 scoop whey · 1 banana', kcal: 250, p: 30, c: 30, f: 1, direction: 'Mix 1 scoop whey protein in 250ml cold water. Drink immediately post-workout and eat banana.' },
      { time: '9:30 PM', type: 'DINNER', item: 'Mexican Corn Chicken Bowl', qty: '150g chicken cooked · ½ cup corn · cucumber/onion · 2 tbsp yogurt · Tajin', kcal: 360, p: 52, c: 20, f: 6, direction: 'Pan-sear chicken breasts. Dice chicken, mix with sweet corn, cucumber, red onion, hung curd, and a squeeze of lemon and Tajin.' },
    ],
  },
  Tue: {
    type: 'Rest Day · Strict Veg (no eggs)',
    meals: [
      { time: '7:30 AM', type: 'PRE-BREAKFAST', item: 'Almonds + black coffee', qty: '25g almonds (~20 pieces)', kcal: 145, p: 5, c: 5, f: 13, direction: 'Count 20 raw almonds. Serve with freshly brewed sugar-free black coffee.' },
      { time: '9:00 AM', type: 'BREAKFAST', item: 'Overnight oats with skyr, milk, whey protein', qty: '40g oats · 150g skyr · 150ml milk · 1 scoop whey', kcal: 415, p: 49, c: 42, f: 9, direction: 'Mix oats, skyr, milk, and whey in a jar or bowl. Stir thoroughly, cover, and refrigerate overnight.' },
      { time: '1:30 PM', type: 'LUNCH', item: 'Chapati + Heavy dal + Soya chunks sabzi + Salad', qty: '2 small chapati · 1.5 katori dal · 50g dry soya chunks (cooked as sabzi) · salad', kcal: 600, p: 40, c: 70, f: 12, direction: 'Soak soya chunks in warm water, squeeze water out, then cook with onion, tomatoes, and spices as sabzi. Serve with dal and chapati.' },
      { time: '5:00 PM', type: 'AFTERNOON', item: 'Whey protein + small banana', qty: '1 scoop whey · 1 small banana', kcal: 215, p: 25, c: 28, f: 1, direction: 'Shake 1 scoop whey protein in cold water and eat banana as an afternoon snack.' },
      { time: '9:30 PM', type: 'DINNER', item: 'Loaded Sweet Potato Bowl with paneer + hung curd', qty: '1 large sweet potato · 150g low-fat paneer · 2 tbsp hung curd · coriander', kcal: 490, p: 37, c: 61, f: 10, direction: 'Bake or microwave sweet potato until soft. Slice open, load with crumbled/cubed low-fat paneer, hung curd, and garnish with coriander.' },
    ],
  },
  Wed: {
    type: 'Pull Day · Non-Veg',
    meals: [
      { time: '7:30 AM', type: 'PRE-BREAKFAST', item: '2 boiled eggs + black coffee', qty: '2 eggs', kcal: 140, p: 12, c: 0, f: 10, direction: 'Boil eggs in bubbling water for 7-10 minutes. Serve with black coffee.' },
      { time: '9:00 AM', type: 'BREAKFAST', item: 'Besan cheela + boiled egg + milk', qty: '2 cheelas (30g besan each) · 1 egg · 200ml milk', kcal: 410, p: 36, c: 46, f: 15, direction: 'Mix besan (chickpea flour) with water, salt, chilies, and coriander into a smooth batter. Pour on hot pan to cook 2 thin crepes. Serve with a boiled egg and milk.' },
      { time: '1:30 PM', type: 'LUNCH', item: 'Chapati + Dal + Chicken curry + Sabzi', qty: '2 small chapati · 1 katori dal · 100-120g chicken · 1 katori sabzi', kcal: 600, p: 45, c: 60, f: 18, direction: 'Reheat chicken curry, dal, and sabzi. Serve hot with 2 fresh chapatis.' },
      { time: '7:00 PM', type: 'PRE-WORKOUT', item: 'Greek yogurt + small banana', qty: '150g Greek yogurt · 1 small banana', kcal: 200, p: 16, c: 28, f: 4, direction: 'Scoop Greek yogurt into a bowl, slice banana on top, and mix. Eat 45 mins before training.' },
      { time: '9:15 PM', type: 'POST-WORKOUT', item: 'Whey protein + banana', qty: '1 scoop whey · 1 banana', kcal: 250, p: 30, c: 30, f: 1, direction: 'Drink whey protein shaken in water and eat banana immediately post-session.' },
      { time: '9:30 PM', type: 'DINNER', item: 'Chicken Rice Tzatziki Jar', qty: '150g chicken cooked · ½ cup cooked rice · cucumber/onion · 3 tbsp tzatziki', kcal: 415, p: 53, c: 28, f: 6, direction: 'Cook chicken cubes. Layer cooked rice, diced chicken, chopped cucumber/onion, and tzatziki sauce in a jar or bowl.' },
    ],
  },
  Thu: {
    type: 'Rest Day · Veg',
    meals: [
      { time: '7:30 AM', type: 'PRE-BREAKFAST', item: 'Almonds + black coffee', qty: '25g almonds', kcal: 145, p: 5, c: 5, f: 13, direction: 'Portion almonds and serve with hot black coffee.' },
      { time: '9:00 AM', type: 'BREAKFAST', item: 'Overnight oats with skyr, milk, whey protein', qty: '40g oats · 150g skyr · 150ml milk · 1 scoop whey', kcal: 415, p: 49, c: 42, f: 9, direction: 'Mix oats, skyr, milk, and whey in a jar or bowl. Stir thoroughly, cover, and refrigerate overnight.' },
      { time: '1:30 PM', type: 'LUNCH', item: 'Chapati + Dal + Paneer sabzi + Salad', qty: '2 small chapati · 1 katori dal · 125g low-fat paneer sabzi · salad', kcal: 615, p: 37, c: 60, f: 25, direction: 'Reheat paneer sabzi and dal. Serve with 2 small chapatis and fresh cucumber/tomato salad.' },
      { time: '5:00 PM', type: 'AFTERNOON', item: 'Whey protein + banana', qty: '1 scoop whey · 1 banana', kcal: 250, p: 30, c: 30, f: 1, direction: 'Mix whey protein scoop with water. Eat banana on the side.' },
      { time: '9:30 PM', type: 'DINNER', item: 'Paneer Pasta Salad Jar', qty: '100g low-fat paneer · 50g dry pasta cooked · veggies · 100g skyr · 1 tbsp red pesto', kcal: 495, p: 40, c: 57, f: 13, direction: 'Boil pasta and drain. Toss with low-fat paneer cubes, chopped mixed veggies, skyr, and red pesto. Serve cold.' },
    ],
  },
  Fri: {
    type: 'Legs Day · Non-Veg (chicken or fish)',
    meals: [
      { time: '7:30 AM', type: 'PRE-BREAKFAST', item: '2 boiled eggs + black coffee', qty: '2 eggs', kcal: 140, p: 12, c: 0, f: 10, direction: 'Hard-boil 2 eggs. Serve with black coffee.' },
      { time: '9:00 AM', type: 'BREAKFAST', item: 'Omelette + toast + skyr', qty: '1 whole + 2 whites omelette · 1 slice toast · 150g skyr', kcal: 370, p: 48, c: 21, f: 13, direction: 'Whisk 1 whole egg + 2 whites. Pour into non-stick pan to make omelette. Serve with toast and cup of skyr.' },
      { time: '1:30 PM', type: 'LUNCH', item: 'Chapati + Dal + Chicken/Fish + Sabzi', qty: '2 small chapati · 1 katori dal · 120g chicken or fish · 1 katori sabzi', kcal: 600, p: 45, c: 60, f: 18, direction: 'Reheat chicken or fish along with dal and sabzi. Serve warm with chapatis.' },
      { time: '3:30 PM', type: 'SNACK', item: '1 apple (carb fuel for leg day)', qty: '1 medium apple', kcal: 95, p: 0, c: 25, f: 0, direction: 'Wash and slice 1 fresh apple. Eat 1-2 hours before pre-workout meal to preload carbs.' },
      { time: '7:00 PM', type: 'PRE-WORKOUT', item: 'Roasted chana + small banana', qty: '40g chana · 1 small banana', kcal: 235, p: 10, c: 45, f: 4, direction: 'Portion 40g roasted chana and banana. Eat 45 mins before heavy leg session.' },
      { time: '9:15 PM', type: 'POST-WORKOUT', item: 'Whey protein + banana', qty: '1 scoop whey · 1 banana', kcal: 250, p: 30, c: 30, f: 1, direction: 'Consume whey protein shake and banana post-workout.' },
      { time: '9:30 PM', type: 'DINNER', item: 'Chicken Pesto Pasta Jar', qty: '150g chicken · 50g dry pasta cooked · veggies · 2 tbsp yogurt · 1 tbsp red pesto', kcal: 555, p: 58, c: 50, f: 11, direction: 'Toss cooked pasta, chicken breast cubes, yogurt, and red pesto. Layer in a jar with fresh spinach or salad veggies.' },
    ],
  },
  Sat: {
    type: 'Rest Day · Veg',
    meals: [
      { time: '7:30 AM', type: 'PRE-BREAKFAST', item: 'Almonds + black coffee', qty: '25g almonds', kcal: 145, p: 5, c: 5, f: 13, direction: 'Serve 25g almonds with sugar-free black coffee.' },
      { time: '9:00 AM', type: 'BREAKFAST', item: 'Overnight oats with skyr, milk, whey protein', qty: '40g oats · 150g skyr · 150ml milk · 1 scoop whey', kcal: 415, p: 49, c: 42, f: 9, direction: 'Mix oats, skyr, milk, and whey in a jar or bowl. Stir thoroughly, cover, and refrigerate overnight.' },
      { time: '1:30 PM', type: 'LUNCH', item: 'High-protein veg combo (paneer + soya + curd)', qty: '2 chapati · 1 katori dal · 100g paneer sabzi · 50g dry soya cooked · 100g curd', kcal: 800, p: 57, c: 72, f: 25, direction: 'Cook soya chunks. Serve paneer sabzi, soya chunks, dal, and curd with 2 fresh warm chapatis.' },
      { time: '5:00 PM', type: 'AFTERNOON', item: 'Whey protein + banana', qty: '1 scoop whey · 1 banana', kcal: 250, p: 30, c: 30, f: 1, direction: 'Drink whey protein shaken in water and eat a banana.' },
      { time: '9:30 PM', type: 'DINNER', item: 'Rice salad with paneer', qty: '100g cooked rice · 150g low-fat paneer · 200g mixed veggies', kcal: 455, p: 37, c: 47, f: 15, direction: 'Toss cooked rice with paneer cubes, chopped cucumber, tomatoes, bell peppers, lemon juice, salt, and pepper.' },
    ],
  },
  Sun: {
    type: 'Flex Day · Rest',
    meals: [
      { time: '8:00 AM', type: 'PRE-BREAKFAST', item: '2 eggs OR 25g almonds + black coffee', qty: '2 eggs OR 25g almonds', kcal: 145, p: 9, c: 3, f: 12, direction: 'Boil eggs or portion almonds. Drink with a cup of hot black coffee.' },
      { time: '9:30 AM', type: 'BREAKFAST', item: 'Overnight oats OR cheela combo', qty: '1 portion', kcal: 415, p: 49, c: 42, f: 9, direction: 'Prepare overnight oats in advance, or cook besan cheelas on a hot pan.' },
      { time: '1:30 PM', type: 'LUNCH', item: 'Normal home lunch (veg or non-veg)', qty: '2 chapati · dal · protein source · sabzi', kcal: 600, p: 40, c: 60, f: 18, direction: 'Enjoy a standard home-cooked lunch prioritizing a solid portion of lean protein (chicken, paneer, or double dal).' },
      { time: '5:00 PM', type: 'AFTERNOON', item: 'Skyr + banana', qty: '200g skyr · 1 banana', kcal: 220, p: 35, c: 35, f: 0, direction: 'Enjoy a fresh tub of skyr with a banana.' },
      { time: '9:00 PM', type: 'DINNER (OFF-PLAN)', item: 'ONE off-plan meal allowed — tikka, kathi roll, paneer dish, restaurant meal', qty: 'Target 500-600 kcal · don\'t go overboard · log everything', kcal: 575, p: 25, c: 50, f: 25, direction: 'Enjoy your weekly off-plan dinner! Aim for high-protein options like chicken tikka, paneer tikka, or a kathi roll. Avoid deep-fried items and sugary desserts.' },
    ],
  },
};

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getTodayDayName = () => DAY_NAMES[new Date().getDay()];

const getWeekNumber = () => {
  const today = new Date();
  const diffDays = Math.floor((today - PLAN_START) / 86400000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
};

const getPhaseInfo = () => {
  const week = getWeekNumber();
  if (week === 8) return { name: 'DELOAD', desc: 'Volume -40%. Same lifts, lighter weight.', rpe: 'RPE 6-7' };
  if (week <= 2) return { name: 'PHASE 1', desc: 'Re-entry. ~50% of old working weights.', rpe: 'RPE 6-7' };
  if (week <= 8) return { name: 'PHASE 2', desc: 'Build. Progressive overload, 8-12 reps.', rpe: 'RPE 8' };
  if (week <= 15) return { name: 'PHASE 3', desc: 'Push. Heavier compounds, 6-10 reps.', rpe: 'RPE 8-9' };
  return { name: 'POST-CUT', desc: 'Plan complete. Reassess goals.', rpe: 'RPE 8' };
};

// Unified storage wrapper with localStorage fallback
const storage = {
  get: async (key) => {
    try {
      if (window.storage && typeof window.storage.get === 'function') {
        return await window.storage.get(key);
      }
    } catch (e) {
      console.warn("Storage.get failed, using localStorage", e);
    }
    const val = localStorage.getItem(key);
    return val ? { value: val } : null;
  },
  set: async (key, val) => {
    try {
      if (window.storage && typeof window.storage.set === 'function') {
        await window.storage.set(key, val);
        return;
      }
    } catch (e) {
      console.warn("Storage.set failed, using localStorage", e);
    }
    localStorage.setItem(key, val);
  },
  delete: async (key) => {
    try {
      if (window.storage && typeof window.storage.delete === 'function') {
        await window.storage.delete(key);
        return;
      }
    } catch (e) {
      console.warn("Storage.delete failed, using localStorage", e);
    }
    localStorage.removeItem(key);
  }
};

// Client-side image compression helper
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 0.75 quality for super lightweight storage footprint
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function WorkoutTracker() {
  const todayDay = getTodayDayName();

  // Navigation state
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'body' | 'sync'
  const [activeSection, setActiveSection] = useState('workout'); // 'workout' | 'diet'
  const [selectedDietDay, setSelectedDietDay] = useState(() => getTodayDayName());

  // Edit Date & derived properties
  const [editDate, setEditDate] = useState(new Date());
  const editDateKey = toDateKey(editDate);
  const editDayName = DAY_NAMES[editDate.getDay()];
  const isTrainingDay = DAYS_ORDER.includes(editDayName);
  const isEditable = isTrainingDay && editDateKey <= toDateKey(new Date());

  const dateInputRef = useRef(null);

  const handleLabelClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      setEditDate(new Date(y, m - 1, d));
    }
  };

  const formatDateLabel = (date) => {
    const dayNameShort = DAY_NAMES[date.getDay()].toUpperCase();
    const mNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthShort = mNames[date.getMonth()];
    const dayNum = date.getDate();
    return `${dayNameShort} · ${dayNum} ${monthShort}`;
  };

  const getRestDayInfo = () => {
    const dayName = DAY_NAMES[editDate.getDay()];
    let suggestion = "Full rest. Sleep priority. No structured activity.";
    let nextText = "Next session: PUSH on Monday";

    if (dayName === 'Tue') {
      suggestion = "30-45 min outdoor walk OR mobility/stretching";
      nextText = "Next session: PULL on Wednesday";
    } else if (dayName === 'Thu') {
      suggestion = "30-45 min outdoor walk OR mobility/stretching";
      nextText = "Next session: LEGS on Friday";
    } else if (dayName === 'Sat') {
      suggestion = "45-60 min walk or recreational activity (sports / hike / anything fun)";
      nextText = "Next session: PUSH on Monday";
    } else if (dayName === 'Sun') {
      suggestion = "Full rest. Sleep priority. No structured activity.";
      nextText = "Next session: PUSH on Monday";
    } else {
      suggestion = "Active recovery or rest day.";
      nextText = "Enjoy your rest!";
    }

    return { suggestion, nextText };
  };

  const restInfo = getRestDayInfo();

  // Workout state
  const getInitialSelectedDay = () => {
    const today = new Date();
    const todayName = DAY_NAMES[today.getDay()];
    return DAYS_ORDER.includes(todayName) ? todayName : 'Rest';
  };
  const [selectedDay, setSelectedDay] = useState(getInitialSelectedDay);
  const [log, setLog] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showWarmup, setShowWarmup] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Sync selectedDay to editDate when editDate changes
  useEffect(() => {
    const dayName = DAY_NAMES[editDate.getDay()];
    if (DAYS_ORDER.includes(dayName)) {
      setSelectedDay(dayName);
    } else {
      setSelectedDay('Rest');
    }
  }, [editDate]);

  // Body metrics state
  const [weightLog, setWeightLog] = useState({});
  const [height, setHeight] = useState('');
  const [bmiImages, setBmiImages] = useState([]);
  const [todayWeight, setTodayWeight] = useState('');
  const [editingHeight, setEditingHeight] = useState(false);
  const [tempHeight, setTempHeight] = useState('');

  // Export / Lightbox state
  const [copySuccess, setCopySuccess] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const phase = getPhaseInfo();
  const week = getWeekNumber();

  // Load fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // Fetch initial data from storage
  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get('workout_log');
        if (result?.value) {
          setLog(JSON.parse(result.value));
        }
      } catch (e) {}

      try {
        const weightResult = await storage.get('weight_log');
        if (weightResult?.value) {
          setWeightLog(JSON.parse(weightResult.value));
        }
      } catch (e) {}

      try {
        const heightResult = await storage.get('user_height');
        if (heightResult?.value) {
          setHeight(heightResult.value);
          setTempHeight(heightResult.value);
        }
      } catch (e) {}

      try {
        const imagesResult = await storage.get('bmi_images');
        if (imagesResult?.value) {
          setBmiImages(JSON.parse(imagesResult.value));
        }
      } catch (e) {}

      setLoading(false);
    })();
  }, []);

  // Saving helpers
  const saveLog = useCallback(async (newLog) => {
    setSaveStatus('saving');
    try {
      await storage.set('workout_log', JSON.stringify(newLog));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1200);
    } catch (e) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, []);

  const saveWeightLog = async (newWeightLog) => {
    try {
      await storage.set('weight_log', JSON.stringify(newWeightLog));
    } catch (e) {
      console.error('Failed to save weight log', e);
    }
  };

  const saveHeight = async (newHeight) => {
    try {
      await storage.set('user_height', newHeight);
    } catch (e) {
      console.error('Failed to save height', e);
    }
  };

  const saveBmiImages = async (newImages) => {
    try {
      await storage.set('bmi_images', JSON.stringify(newImages));
    } catch (e) {
      console.error('Failed to save BMI images', e);
    }
  };

  // Workout metrics getters & setters
  const getSetsForExercise = (date, exerciseName) => {
    return log[date]?.exercises?.[exerciseName] || [];
  };

  const getLastSession = (exerciseName) => {
    const dates = Object.keys(log).sort().reverse();
    for (const date of dates) {
      if (date >= editDateKey) continue;
      const sets = log[date]?.exercises?.[exerciseName];
      if (sets && sets.length > 0 && sets.some(s => s.weight || s.reps)) {
        return { date, sets };
      }
    }
    return null;
  };

  const updateSet = (exerciseName, setIndex, field, value) => {
    setLog(prevLog => {
      const newLog = { ...prevLog };
      if (!newLog[editDateKey]) newLog[editDateKey] = { day: editDayName, exercises: {} };
      if (!newLog[editDateKey].exercises[exerciseName]) {
        const setCount = WORKOUT_PLAN[selectedDay]?.exercises?.find(e => e.name === exerciseName)?.sets || 3;
        newLog[editDateKey].exercises[exerciseName] = Array(setCount).fill(null).map(() => ({ weight: '', reps: '', done: false }));
      }
      newLog[editDateKey].exercises[exerciseName][setIndex] = {
        ...newLog[editDateKey].exercises[exerciseName][setIndex],
        [field]: value,
      };
      saveLog(newLog);
      return newLog;
    });
  };

  // Reset all app storage
  const resetAllData = async () => {
    try {
      await storage.delete('workout_log');
      await storage.delete('weight_log');
      await storage.delete('user_height');
      await storage.delete('bmi_images');
      setLog({});
      setWeightLog({});
      setHeight('');
      setTempHeight('');
      setBmiImages([]);
      setConfirmReset(false);
      alert("All data cleared successfully.");
    } catch (e) {
      console.error('Reset failed', e);
    }
  };

  const getSelectedDayProgress = () => {
    const dayData = log[editDateKey]?.exercises || {};
    const totalSets = WORKOUT_PLAN[selectedDay]?.exercises?.reduce((sum, ex) => sum + ex.sets, 0) || 0;
    let doneSets = 0;
    Object.values(dayData).forEach(sets => {
      sets.forEach(s => { if (s.done) doneSets++; });
    });
    return { done: doneSets, total: totalSets };
  };

  const progress = getSelectedDayProgress();

  // Weight & BMI triggers
  const handleLogWeight = async () => {
    if (!todayWeight || isNaN(parseFloat(todayWeight))) {
      alert("Please enter a valid weight number.");
      return;
    }
    const updatedLog = {
      ...weightLog,
      [editDateKey]: parseFloat(todayWeight)
    };
    setWeightLog(updatedLog);
    await saveWeightLog(updatedLog);
    setTodayWeight('');
  };

  const handleDeleteWeight = async (dateKey) => {
    if (confirm(`Delete weight record for ${dateKey}?`)) {
      const updatedLog = { ...weightLog };
      delete updatedLog[dateKey];
      setWeightLog(updatedLog);
      await saveWeightLog(updatedLog);
    }
  };

  const handleSaveHeight = async () => {
    if (!tempHeight || isNaN(parseFloat(tempHeight))) {
      alert("Please enter a valid height in cm.");
      return;
    }
    setHeight(tempHeight);
    await saveHeight(tempHeight);
    setEditingHeight(false);
  };

  // Image Upload handles
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (bmiImages.length >= MAX_BMI_IMAGES) {
      alert(`Maximum of ${MAX_BMI_IMAGES} screenshots allowed. Please delete one first.`);
      return;
    }

    try {
      const compressed = await compressImage(file);
      const newImage = {
        id: Date.now().toString(),
        date: toDateKey(new Date()),
        dataUrl: compressed
      };
      const updatedImages = [...bmiImages, newImage];
      setBmiImages(updatedImages);
      await saveBmiImages(updatedImages);
    } catch (err) {
      console.error(err);
      alert("Failed to process and compress image.");
    }
  };

  const handleDeleteImage = async (id) => {
    if (confirm("Delete this screenshot?")) {
      const updatedImages = bmiImages.filter(img => img.id !== id);
      setBmiImages(updatedImages);
      await saveBmiImages(updatedImages);
    }
  };

  // "Copy for Claude" builder
  const handleCopyToClipboard = () => {
    let md = `# LIFT LOG PROGRESS REPORT\n`;
    md += `Exported: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`;

    // Height & Weight profile
    const h = parseFloat(height);
    const sortedWeights = Object.keys(weightLog).sort().reverse();
    const currentWeightKey = sortedWeights[0];
    const currentWeight = currentWeightKey ? weightLog[currentWeightKey] : null;

    md += `## Profile & Body Metrics\n`;
    md += `- Height: ${h ? h + ' cm' : 'Not set'}\n`;
    md += `- Current Weight: ${currentWeight ? currentWeight + ' kg' : 'Not logged'}\n`;
    if (h && currentWeight) {
      const bmiVal = (currentWeight / ((h / 100) * (h / 100))).toFixed(1);
      md += `- Current BMI: ${bmiVal}\n`;
    }
    md += `\n`;

    // Weight History
    if (sortedWeights.length > 0) {
      md += `## Recent Weight Trend\n`;
      md += `| Date | Weight (kg) | BMI |\n`;
      md += `| :--- | :--- | :--- |\n`;
      sortedWeights.slice(0, 10).forEach(dateStr => {
        const w = weightLog[dateStr];
        const bmiStr = h ? (w / ((h / 100) * (h / 100))).toFixed(1) : '—';
        md += `| ${dateStr} | ${w} | ${bmiStr} |\n`;
      });
      md += `\n`;
    }

    // Workout details
    md += `## Recent Workout Progression (Last 10 sessions logged)\n`;
    const sortedLogDates = Object.keys(log).sort().reverse().slice(0, 10);
    if (sortedLogDates.length === 0) {
      md += `No workouts logged yet.\n`;
    } else {
      sortedLogDates.forEach(dateKey => {
        const dayData = log[dateKey];
        md += `\n### ${dayData.day.toUpperCase()} (${dateKey})\n`;
        Object.keys(dayData.exercises).forEach(exName => {
          const setsList = dayData.exercises[exName];
          const validSets = setsList.filter(s => s.done && (s.weight || s.reps));
          if (validSets.length > 0) {
            const setsStr = validSets.map((s, idx) => `Set ${idx + 1}: ${s.weight}kg x ${s.reps}`).join(' | ');
            md += `- **${exName}**: ${setsStr}\n`;
          }
        });
      });
    }

    navigator.clipboard.writeText(md)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('Copy failed', err);
        alert("Clipboard copy failed. Please select and copy text manually.");
      });
  };

  // JSON backup handlers
  const handleExportBackup = () => {
    const backupData = {
      workout_log: log,
      weight_log: weightLog,
      user_height: height,
      bmi_images: bmiImages
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lift_log_backup_${toDateKey(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Prompt user to clear images after export finishes to free up space
    if (bmiImages.length > 0) {
      setTimeout(async () => {
        if (confirm("Backup exported successfully! Would you like to clear the screenshots stored in the app to free up storage space? (Your downloaded backup file will still contain these images safely.)")) {
          setBmiImages([]);
          await saveBmiImages([]);
        }
      }, 500);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.workout_log) {
          setLog(data.workout_log);
          await storage.set('workout_log', JSON.stringify(data.workout_log));
        }
        if (data.weight_log) {
          setWeightLog(data.weight_log);
          await storage.set('weight_log', JSON.stringify(data.weight_log));
        }
        if (data.user_height) {
          setHeight(data.user_height);
          setTempHeight(data.user_height);
          await storage.set('user_height', data.user_height);
        }
        if (data.bmi_images) {
          setBmiImages(data.bmi_images);
          await storage.set('bmi_images', JSON.stringify(data.bmi_images));
        }
        
        alert("Backup restored successfully!");
        e.target.value = null; // Clear file picker
      } catch (err) {
        console.error(err);
        alert("Failed to restore backup. Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  // Math logic for current display
  const getBmiDetails = () => {
    const h = parseFloat(height);
    const sortedWeights = Object.keys(weightLog).sort().reverse();
    const currentWeightKey = sortedWeights[0];
    const currentWeight = currentWeightKey ? weightLog[currentWeightKey] : null;

    if (!h || !currentWeight) return null;

    const val = (currentWeight / ((h / 100) * (h / 100))).toFixed(1);
    let category = "Normal";
    let color = "#fbbf24";

    if (val < 18.5) {
      category = "Underweight";
      color = "#3b82f6";
    } else if (val >= 25 && val < 30) {
      category = "Overweight";
      color = "#f97316";
    } else if (val >= 30) {
      category = "Obese";
      color = "#ef4444";
    }

    return { val, category, color, currentWeight };
  };

  const bmiDetails = getBmiDetails();

  if (loading) {
    return (
      <div style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        color: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: '14px',
        letterSpacing: '0.1em',
      }}>
        LOADING...
      </div>
    );
  }

  const currentWorkout = WORKOUT_PLAN[selectedDay];

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      color: '#fafafa',
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      paddingBottom: '80px', /* Extra space for bottom tab bar and notch */
    }}>
      {/* ----------------- WORKOUT TAB ----------------- */}
      {activeTab === 'workout' && (
        <>
          <header style={{ padding: '20px 16px 14px', borderBottom: '1px solid #262626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div>
                <div style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: '34px',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  color: '#fafafa',
                }}>
                  LIFT LOG
                </div>
                <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.15em', marginTop: '4px' }}>
                  CUT · MAY–AUG 2026
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {saveStatus === 'saved' && (
                  <div style={{ fontSize: '10px', color: '#fbbf24', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={11} strokeWidth={3} /> SAVED
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '0.1em' }}>
                    SAVE FAILED
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '12px', flexWrap: 'wrap' }}>
              <span>WEEK {week}/15</span>
              <span style={{ color: '#fbbf24' }}>{phase.name}</span>
              <span>{phase.rpe}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '6px', lineHeight: 1.4 }}>
              {phase.desc}
            </div>
          </header>

          {/* Section Toggle */}
          <div style={{ display: 'flex', borderBottom: '1px solid #262626', background: '#0a0a0a' }}>
            <button
              onClick={() => setActiveSection('workout')}
              style={{
                flex: 1,
                padding: '12px 0',
                background: activeSection === 'workout' ? '#161616' : 'transparent',
                border: 'none',
                borderBottom: activeSection === 'workout' ? '2px solid #fbbf24' : '2px solid transparent',
                color: activeSection === 'workout' ? '#fbbf24' : '#666',
                fontFamily: 'Anton, sans-serif',
                fontSize: '16px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              WORKOUT
            </button>
            <button
              onClick={() => setActiveSection('diet')}
              style={{
                flex: 1,
                padding: '12px 0',
                background: activeSection === 'diet' ? '#161616' : 'transparent',
                border: 'none',
                borderBottom: activeSection === 'diet' ? '2px solid #fbbf24' : '2px solid transparent',
                color: activeSection === 'diet' ? '#fbbf24' : '#666',
                fontFamily: 'Anton, sans-serif',
                fontSize: '16px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              DIET
            </button>
          </div>

          {activeSection === 'workout' ? (
            <>
              {/* Date Navigation Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #262626',
                background: '#0f0f0f',
              }}>
                <button
                  onClick={() => {
                    const d = new Date(editDate);
                    d.setDate(d.getDate() - 1);
                    setEditDate(d);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fafafa',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={handleLabelClick}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: editDateKey === toDateKey(new Date()) ? '#fbbf24' : '#fafafa',
                      fontFamily: 'Anton, sans-serif',
                      fontSize: '16px',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {editDateKey === toDateKey(new Date()) ? 'TODAY' : formatDateLabel(editDate)}
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    max={toDateKey(new Date())}
                    value={editDateKey}
                    onChange={handleDateChange}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: 0,
                      height: 0,
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const d = new Date(editDate);
                    d.setDate(d.getDate() + 1);
                    setEditDate(d);
                  }}
                  disabled={editDateKey === toDateKey(new Date())}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: editDateKey === toDateKey(new Date()) ? '#333' : '#fafafa',
                    cursor: editDateKey === toDateKey(new Date()) ? 'default' : 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: editDateKey === toDateKey(new Date()) ? 0.3 : 1,
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid #262626', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
                {DAYS_ORDER.map(day => {
                  const isActive = day === selectedDay;
                  const isToday = day === todayDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        flex: 1,
                        padding: '14px 4px 12px',
                        background: isActive ? '#161616' : 'transparent',
                        border: 'none',
                        borderBottom: isActive ? '2px solid #fbbf24' : '2px solid transparent',
                        color: isActive ? '#fbbf24' : isToday ? '#fafafa' : '#666',
                        fontFamily: 'Anton, sans-serif',
                        fontSize: '15px',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        position: 'relative',
                        minWidth: '0',
                        transition: 'all 0.15s',
                      }}
                    >
                      {day.toUpperCase()}
                      {isToday && !isActive && (
                        <span style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: '#fbbf24',
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDay === 'Rest' ? (
                <div style={{
                  margin: '24px 16px',
                  padding: '32px 24px',
                  border: '1px solid #262626',
                  background: '#0f0f0f',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: '28px',
                    color: '#fbbf24',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                  }}>
                    REST DAY
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#666',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}>
                    SUGGESTED ACTIVITY
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: '#fafafa',
                    lineHeight: '1.5',
                    marginBottom: '28px',
                  }}>
                    {restInfo.suggestion}
                  </div>
                  <div style={{
                    borderTop: '1px solid #1f1f1f',
                    paddingTop: '20px',
                    fontSize: '12px',
                    color: '#888',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {restInfo.nextText}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ padding: '18px 16px 8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{
                          fontFamily: 'Anton, sans-serif',
                          fontSize: '38px',
                          letterSpacing: '0.03em',
                          lineHeight: 0.95,
                          color: '#fafafa',
                        }}>
                          {currentWorkout?.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>
                          {currentWorkout?.focus}
                        </div>
                      </div>
                      {progress && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontFamily: 'Anton, sans-serif',
                            fontSize: '28px',
                            color: progress.done === progress.total ? '#fbbf24' : '#fafafa',
                            letterSpacing: '0.02em',
                            lineHeight: 1,
                          }}>
                            {progress.done}<span style={{ color: '#444' }}>/{progress.total}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.1em', marginTop: '4px' }}>
                            SETS DONE
                          </div>
                        </div>
                      )}
                    </div>
                    {!isEditable ? (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: '#1a1408',
                        border: '1px solid #4a3a0a',
                        fontSize: '11px',
                        color: '#fbbf24',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <AlertCircle size={12} />
                        <span>VIEWING PLAN ONLY — future date ({editDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()})</span>
                      </div>
                    ) : (
                      editDateKey !== toDateKey(new Date()) && (
                        <div style={{
                          marginTop: '12px',
                          padding: '8px 12px',
                          background: '#0a1d37',
                          border: '1px solid #0f4c81',
                          fontSize: '11px',
                          color: '#38bdf8',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <AlertCircle size={12} color="#38bdf8" />
                          <span>LOGGING PAST WORKOUT — Date: {editDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )
                    )}
                  </div>

                  <div style={{ margin: '14px 16px', border: '1px solid #262626', background: '#0f0f0f' }}>
                    <button
                      onClick={() => setShowWarmup(s => !s)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#fafafa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={12} color="#fbbf24" /> WARMUP
                      </span>
                      {showWarmup ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
                    </button>
                    {showWarmup && (
                      <div style={{ padding: '0 14px 14px', fontSize: '13px', color: '#aaa', lineHeight: 1.5 }}>
                        {currentWorkout?.warmup}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '0 16px' }}>
                    {currentWorkout?.exercises?.map((ex, idx) => (
                      <ExerciseCard
                        key={ex.name}
                        exercise={ex}
                        number={idx + 1}
                        sets={getSetsForExercise(editDateKey, ex.name)}
                        lastSession={getLastSession(ex.name)}
                        onUpdate={isEditable ? (setIdx, field, val) => updateSet(ex.name, setIdx, field, val) : null}
                        readOnly={!isEditable}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Diet Sub-Navigation Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #262626', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const isActive = day === selectedDietDay;
                  const isToday = day === todayDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDietDay(day)}
                      style={{
                        flex: 1,
                        padding: '14px 2px 12px',
                        background: isActive ? '#161616' : 'transparent',
                        border: 'none',
                        borderBottom: isActive ? '2px solid #fbbf24' : '2px solid transparent',
                        color: isActive ? '#fbbf24' : isToday ? '#fafafa' : '#666',
                        fontFamily: 'Anton, sans-serif',
                        fontSize: '13px',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        position: 'relative',
                        minWidth: '0',
                        transition: 'all 0.15s',
                      }}
                    >
                      {day.toUpperCase()}
                      {isToday && !isActive && (
                        <span style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: '#fbbf24',
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: '18px 16px 8px' }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: '38px',
                  letterSpacing: '0.03em',
                  lineHeight: 0.95,
                  color: '#fafafa',
                  textTransform: 'uppercase',
                }}>
                  {selectedDietDay === 'Mon' ? 'MONDAY' :
                   selectedDietDay === 'Tue' ? 'TUESDAY' :
                   selectedDietDay === 'Wed' ? 'WEDNESDAY' :
                   selectedDietDay === 'Thu' ? 'THURSDAY' :
                   selectedDietDay === 'Fri' ? 'FRIDAY' :
                   selectedDietDay === 'Sat' ? 'SATURDAY' : 'SUNDAY'}
                </div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>
                  {DIET_PLAN[selectedDietDay]?.type}
                </div>
              </div>

              {/* Rules Card */}
              <div style={{
                margin: '10px 16px 14px',
                padding: '12px 14px',
                border: '1px solid #262626',
                background: '#0f0f0f',
              }}>
                <div style={{
                  fontSize: '10px',
                  color: '#fbbf24',
                  letterSpacing: '0.1em',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <AlertCircle size={12} color="#fbbf24" /> DIET RULES
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '12px',
                  color: '#aaa',
                  lineHeight: '1.6',
                }}>
                  <li>1 off-plan meal/week · Sunday dinner only</li>
                  <li>Every meal needs a protein anchor</li>
                  <li>Weigh portions for 2 weeks, then eyeball</li>
                  <li>Kitchen closes after dinner</li>
                </ul>
              </div>

              {/* Meal Cards */}
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DIET_PLAN[selectedDietDay]?.meals.map((meal, idx) => (
                  <MealCard key={idx} meal={meal} />
                ))}
              </div>

              {/* Daily Macro Footer */}
              <div style={{
                margin: '20px 16px 24px',
                padding: '16px 20px',
                border: '1px solid #262626',
                background: '#0f0f0f',
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  fontWeight: 'bold',
                }}>
                  DAILY TOTAL
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '32px', color: '#fbbf24', lineHeight: 1 }}>
                      {DIET_PLAN[selectedDietDay]?.meals.reduce((sum, m) => sum + m.kcal, 0)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.05em', marginTop: '4px' }}>
                      KCAL
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '32px', color: '#fafafa', lineHeight: 1 }}>
                      {DIET_PLAN[selectedDietDay]?.meals.reduce((sum, m) => sum + m.p, 0)}g
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.05em', marginTop: '4px' }}>
                      PROTEIN
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '32px', color: '#fafafa', lineHeight: 1 }}>
                      {DIET_PLAN[selectedDietDay]?.meals.reduce((sum, m) => sum + m.c, 0)}g
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.05em', marginTop: '4px' }}>
                      CARBS
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '32px', color: '#fafafa', lineHeight: 1 }}>
                      {DIET_PLAN[selectedDietDay]?.meals.reduce((sum, m) => sum + m.f, 0)}g
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.05em', marginTop: '4px' }}>
                      FAT
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ----------------- BODY METRICS TAB ----------------- */}
      {activeTab === 'body' && (
        <div style={{ padding: '24px 16px 16px' }}>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '34px',
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: '#fafafa',
            marginBottom: '4px'
          }}>
            BODY METRICS
          </div>
          <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
            WEIGHT & BMI TRACKING
          </div>

          {/* Quick Profile Dashboard */}
          <div style={{ background: '#0f0f0f', border: '1px solid #262626', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f1f1f', paddingBottom: '12px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em' }}>YOUR HEIGHT</span>
                {editingHeight ? (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={tempHeight}
                      onChange={(e) => setTempHeight(e.target.value)}
                      placeholder="cm"
                      style={{
                        background: '#161616',
                        border: '1px solid #444',
                        color: '#fff',
                        padding: '4px 8px',
                        width: '60px',
                        textAlign: 'center',
                        fontSize: '14px',
                      }}
                    />
                    <button onClick={handleSaveHeight} style={{ background: '#fbbf24', border: 'none', color: '#000', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE</button>
                    <button onClick={() => setEditingHeight(false)} style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>CANCEL</button>
                  </div>
                ) : (
                  <div style={{ fontSize: '20px', fontFamily: 'Anton, sans-serif', color: height ? '#fff' : '#444', marginTop: '4px' }}>
                    {height ? `${height} cm` : 'Not Set'}{' '}
                    <button
                      onClick={() => setEditingHeight(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fbbf24',
                        fontSize: '11px',
                        marginLeft: '8px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em' }}>CURRENT WEIGHT</span>
                <div style={{ fontSize: '20px', fontFamily: 'Anton, sans-serif', color: bmiDetails ? '#fff' : '#444', marginTop: '4px' }}>
                  {bmiDetails ? `${bmiDetails.currentWeight} kg` : 'None logged'}
                </div>
              </div>
            </div>

            {bmiDetails ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161616', padding: '10px 12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#666', letterSpacing: '0.08em' }}>CALCULATED BMI</span>
                  <div style={{ fontSize: '24px', fontFamily: 'Anton, sans-serif', color: '#fbbf24' }}>
                    {bmiDetails.val}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#666', letterSpacing: '0.08em' }}>CLASSIFICATION</span>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: bmiDetails.color, marginTop: '2px' }}>
                    {bmiDetails.category.toUpperCase()}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                Add height and log a weight to view your current BMI analysis.
              </div>
            )}
          </div>

          {/* Log Today's Weight */}
          <div style={{ background: '#0f0f0f', border: '1px solid #262626', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
              LOG WEIGHT FOR {editDateKey === toDateKey(new Date()) ? 'TODAY' : editDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()} ({editDateKey})
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 78.5"
                  value={todayWeight}
                  onChange={(e) => setTodayWeight(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px',
                    background: '#161616',
                    border: '1px solid #262626',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                  }}
                />
                <span style={{ position: 'absolute', right: '14px', top: '13px', fontSize: '14px', color: '#555' }}>KG</span>
              </div>
              <button
                onClick={handleLogWeight}
                style={{
                  background: '#fbbf24',
                  border: 'none',
                  color: '#0a0a0a',
                  fontFamily: 'Anton, sans-serif',
                  fontSize: '14px',
                  letterSpacing: '0.08em',
                  padding: '0 24px',
                  cursor: 'pointer',
                }}
              >
                LOG WEIGHT
              </button>
            </div>
            {weightLog[editDateKey] && (
              <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '8px', textAlign: 'center' }}>
                ✓ Weight logged for this date as {weightLog[editDateKey]} kg. Submitting again will update this value.
              </div>
            )}
          </div>

          {/* BMI / Body Comp Screenshot Uploads */}
          <div style={{ background: '#0f0f0f', border: '1px solid #262626', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold' }}>
                BMI SCREENSHOTS ({bmiImages.length}/{MAX_BMI_IMAGES})
              </span>
              {bmiImages.length < MAX_BMI_IMAGES && (
                <label style={{
                  background: 'transparent',
                  border: '1px solid #fbbf24',
                  color: '#fbbf24',
                  padding: '4px 8px',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Upload size={11} /> UPLOAD
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            
            {bmiImages.length === 0 ? (
              <div style={{
                border: '1px dashed #262626',
                padding: '24px',
                textAlign: 'center',
                color: '#555',
                fontSize: '12px',
              }}>
                Upload progress scans or BMI report screenshots here.<br/>
                They will be compressed and saved offline.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {bmiImages.map((img) => (
                  <div 
                    key={img.id} 
                    style={{ 
                      position: 'relative', 
                      width: 'calc(33.33% - 8px)', 
                      aspectRatio: '1', 
                      border: '1px solid #262626',
                      background: '#161616',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <img 
                      src={img.dataUrl} 
                      alt="BMI report" 
                      onClick={() => setLightboxImage(img.dataUrl)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <X size={10} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.6)',
                      fontSize: '8px',
                      color: '#aaa',
                      textAlign: 'center',
                      padding: '2px 0'
                    }}>
                      {img.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weight Log History */}
          <div style={{ background: '#0f0f0f', border: '1px solid #262626', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
              WEIGHT HISTORY LOG
            </div>
            
            {Object.keys(weightLog).length === 0 ? (
              <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', padding: '8px 0' }}>
                No weight logs recorded yet.
              </div>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #1f1f1f' }}>
                {Object.keys(weightLog).sort().reverse().map((dateStr) => {
                  const wVal = weightLog[dateStr];
                  const hVal = parseFloat(height);
                  const bmiVal = hVal ? (wVal / ((hVal / 100) * (hVal / 100))).toFixed(1) : null;
                  return (
                    <div
                      key={dateStr}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        borderBottom: '1px solid #181818',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ color: '#888' }}>{dateStr}</span>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{wVal} kg</span>
                        {bmiVal && <span style={{ color: '#fbbf24', fontSize: '12px' }}>BMI: {bmiVal}</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteWeight(dateStr)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#666',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- CLAUDE & SYNC TAB ----------------- */}
      {activeTab === 'sync' && (
        <div style={{ padding: '24px 16px 16px' }}>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '34px',
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: '#fafafa',
            marginBottom: '4px'
          }}>
            CLAUDE & SYNC
          </div>
          <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
            BACKUPS & INTELLIGENCE
          </div>

          {/* Copy for Claude Card */}
          <div style={{ background: '#0f0f0f', border: '1px solid #262626', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Brain size={18} color="#fbbf24" />
              <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.08em', color: '#fafafa' }}>
                EXPORT FOR CLAUDE ANALYSIS
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5, marginBottom: '16px' }}>
              Generate a custom formatted Markdown document of all your logged weight history and recent workout progression. You can paste this directly into a Claude chat to receive coaching feedback, trends, and progression advice.
            </p>
            <button
              onClick={handleCopyToClipboard}
              style={{
                width: '100%',
                background: copySuccess ? '#22c55e' : '#fbbf24',
                color: copySuccess ? '#fff' : '#0a0a0a',
                border: 'none',
                fontFamily: 'Anton, sans-serif',
                fontSize: '14px',
                letterSpacing: '0.1em',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
            >
              {copySuccess ? (
                <>
                  <Check size={16} strokeWidth={3} /> COPIED TO CLIPBOARD
                </>
              ) : (
                <>
                  <Copy size={16} /> COPY DATA FOR CLAUDE
                </>
              )}
            </button>
          </div>

          {/* Local Backups Card */}
          <div style={{ background: '#0f0f0f', border: '1px solid #262626', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 'bold' }}>
              LOCAL BACKUPS (JSON)
            </div>
            <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.4, marginBottom: '16px' }}>
              Save a full backup file of your workout trackers, weight entries, and compressed scan screenshots. We recommend exporting periodically to preserve your data offline.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleExportBackup}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#fff',
                  padding: '10px',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} /> EXPORT BACKUP
              </button>
              <label style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid #444',
                color: '#fff',
                padding: '10px',
                fontSize: '12px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Upload size={14} /> IMPORT BACKUP
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Diagnostics Section */}
          <div style={{ background: '#0f0f0f', border: '1px solid #262626', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
              STORAGE STATS
            </div>
            <div style={{ fontSize: '12px', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Days logged:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{Object.keys(log).length} sessions</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Weight entries:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{Object.keys(weightLog).length} logs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>BMI Scan Images:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{bmiImages.length}/{MAX_BMI_IMAGES} uploaded</span>
              </div>
            </div>
          </div>

          {/* Reset System */}
          <div style={{ background: '#0f0f0f', border: '1px solid #3a1515', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#ef4444', letterSpacing: '0.1em', fontWeight: 'bold', marginBottom: '8px' }}>
              DANGER ZONE
            </div>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 16px 0' }}>
              This will permanently delete all workouts, weights, settings, and screenshots. Make sure you have exported a backup.
            </p>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 16px',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={12} /> RESET ALL DATA
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={resetAllData}
                  style={{
                    background: '#7f1d1d',
                    border: '1px solid #b91c1c',
                    color: '#fff',
                    padding: '8px 16px',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  CONFIRM CLEAR
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #444',
                    color: '#888',
                    padding: '8px 16px',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- FIXED BOTTOM NAV TAB BAR ----------------- */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#121212',
        borderTop: '1px solid #262626',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        /* Support notch on iPhone 13 mini safe area */
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxSizing: 'content-box'
      }}>
        <button
          onClick={() => setActiveTab('workout')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'workout' ? '#fbbf24' : '#666',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '10px',
            letterSpacing: '0.05em',
            flex: 1,
            padding: '4px 0',
          }}
        >
          <Dumbbell size={20} />
          <span>WORKOUT</span>
        </button>

        <button
          onClick={() => setActiveTab('body')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'body' ? '#fbbf24' : '#666',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '10px',
            letterSpacing: '0.05em',
            flex: 1,
            padding: '4px 0',
          }}
        >
          <Scale size={20} />
          <span>BODY METRICS</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'sync' ? '#fbbf24' : '#666',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '10px',
            letterSpacing: '0.05em',
            flex: 1,
            padding: '4px 0',
          }}
        >
          <Brain size={20} />
          <span>CLAUDE & SYNC</span>
        </button>
      </div>

      {/* Image Lightbox Overlay */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <img 
            src={lightboxImage} 
            alt="BMI scan fullview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '85vh', 
              objectFit: 'contain',
              border: '2px solid #262626'
            }} 
          />
          <button 
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={28} />
          </button>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, number, sets, lastSession, onUpdate, readOnly }) {
  const [showNote, setShowNote] = useState(false);
  const setCount = exercise.sets;

  const displaySets = Array(setCount).fill(null).map((_, i) =>
    sets[i] || { weight: '', reps: '', done: false }
  );

  const formatLastSession = () => {
    if (!lastSession) return null;
    const dateObj = new Date(lastSession.date);
    const today = new Date();
    const diffDays = Math.floor((today - dateObj) / 86400000);
    let dateStr;
    if (diffDays === 0) dateStr = 'TODAY';
    else if (diffDays === 1) dateStr = 'YDAY';
    else if (diffDays < 8) dateStr = `${diffDays}D AGO`;
    else dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();

    const setStrings = lastSession.sets
      .filter(s => s.weight || s.reps)
      .map(s => `${s.weight || '?'}×${s.reps || '?'}`)
      .join('  ');
    return { dateStr, setStrings };
  };

  const last = formatLastSession();

  return (
    <div style={{
      border: '1px solid #262626',
      background: '#0f0f0f',
      marginBottom: '10px',
    }}>
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '22px',
            color: exercise.isCompound ? '#fbbf24' : '#333',
            minWidth: '26px',
            lineHeight: 1,
            marginTop: '2px',
            letterSpacing: '0.02em',
          }}>
            {String(number).padStart(2, '0')}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.25, color: '#fafafa' }}>
              {exercise.name}
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '3px', letterSpacing: '0.05em' }}>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{setCount} SETS</span>
              <span style={{ color: '#444', margin: '0 6px' }}>·</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{exercise.reps} REPS</span>
              {exercise.isCompound && (
                <>
                  <span style={{ color: '#444', margin: '0 6px' }}>·</span>
                  <span style={{ color: '#fbbf24' }}>COMPOUND</span>
                </>
              )}
            </div>
          </div>
          {exercise.note && (
            <button
              onClick={() => setShowNote(s => !s)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '4px',
                marginTop: '-2px',
              }}
            >
              {showNote ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
        {showNote && exercise.note && (
          <div style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '8px',
            lineHeight: 1.45,
            fontStyle: 'italic',
            borderLeft: '2px solid #2a2a2a',
            marginLeft: '14px',
            paddingLeft: '12px',
          }}>
            {exercise.note}
          </div>
        )}
        {last && (
          <div style={{
            fontSize: '10px',
            color: '#666',
            marginTop: '8px',
            paddingLeft: '38px',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <History size={10} />
            <span style={{ color: '#888' }}>LAST {last.dateStr}:</span>
            <span style={{ color: '#aaa', letterSpacing: '0.02em' }}>{last.setStrings || '—'}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '6px 14px 10px' }}>
        {displaySets.map((set, idx) => (
          <SetRow
            key={idx}
            setNumber={idx + 1}
            set={set}
            onChange={onUpdate ? (field, val) => onUpdate(idx, field, val) : null}
            readOnly={readOnly}
            isLast={idx === displaySets.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function SetRow({ setNumber, set, onChange, readOnly, isLast }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 0',
      borderBottom: isLast ? 'none' : '1px solid #181818',
    }}>
      <span style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: '15px',
        color: set.done ? '#fbbf24' : '#444',
        minWidth: '20px',
        letterSpacing: '0.05em',
      }}>
        {setNumber}
      </span>
      <InputBox
        value={set.weight}
        onChange={onChange ? v => onChange('weight', v) : null}
        placeholder="kg"
        readOnly={readOnly}
        inputMode="decimal"
        done={set.done}
      />
      <span style={{ color: '#333', fontSize: '14px', fontWeight: 300 }}>×</span>
      <InputBox
        value={set.reps}
        onChange={onChange ? v => onChange('reps', v) : null}
        placeholder="reps"
        readOnly={readOnly}
        inputMode="numeric"
        done={set.done}
      />
      <button
        onClick={onChange ? () => onChange('done', !set.done) : undefined}
        disabled={readOnly}
        style={{
          marginLeft: 'auto',
          width: '38px',
          height: '38px',
          border: `1.5px solid ${set.done ? '#fbbf24' : '#333'}`,
          background: set.done ? '#fbbf24' : 'transparent',
          color: set.done ? '#0a0a0a' : '#444',
          cursor: readOnly ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.12s',
          padding: 0,
          opacity: readOnly ? 0.5 : 1,
        }}
      >
        {set.done && <Check size={18} strokeWidth={3} />}
      </button>
    </div>
  );
}

function InputBox({ value, onChange, placeholder, readOnly, inputMode, done }) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      type="text"
      inputMode={inputMode}
      value={value || ''}
      onChange={onChange ? e => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '68px',
        padding: '9px 8px',
        background: '#161616',
        border: `1px solid ${focused ? '#fbbf24' : done ? '#3a2f0a' : '#262626'}`,
        color: done ? '#fbbf24' : '#fafafa',
        fontSize: '15px',
        fontFamily: 'inherit',
        fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'center',
        outline: 'none',
        transition: 'border-color 0.12s',
        WebkitAppearance: 'none',
        MozAppearance: 'textfield',
        borderRadius: 0,
      }}
    />
  );
}

function MealCard({ meal }) {
  const [showDirections, setShowDirections] = useState(false);
  const isOffPlan = meal.type === 'DINNER (OFF-PLAN)';

  return (
    <div style={{
      border: '1px solid #262626',
      background: '#0f0f0f',
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', letterSpacing: '0.05em' }}>
          <span style={{ color: '#666', fontWeight: 600 }}>{meal.time}</span>
          <span style={{ color: '#444' }}>·</span>
          <span style={{ 
            color: isOffPlan ? '#fbbf24' : '#888',
            fontWeight: 700,
          }}>
            {meal.type}
          </span>
        </div>
        {meal.direction && (
          <button
            onClick={() => setShowDirections(s => !s)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fbbf24',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '2px 4px',
              textDecoration: 'underline',
            }}
          >
            {showDirections ? 'Hide Recipe' : 'Recipe'}
          </button>
        )}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#fafafa', lineHeight: 1.3, marginBottom: '6px' }}>
        {meal.item}
      </div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', lineHeight: 1.4 }}>
        {meal.qty}
      </div>
      
      {showDirections && meal.direction && (
        <div style={{
          fontSize: '12px',
          color: '#999',
          lineHeight: '1.45',
          fontStyle: 'italic',
          background: '#161616',
          padding: '8px 10px',
          borderLeft: '2px solid #fbbf24',
          marginBottom: '10px',
        }}>
          {meal.direction}
        </div>
      )}

      <div style={{ 
        fontSize: '11px', 
        color: '#666', 
        fontFamily: 'monospace', 
        letterSpacing: '0.02em',
        borderTop: '1px solid #1a1a1a',
        paddingTop: '8px',
      }}>
        {meal.kcal} kcal · {meal.p}P · {meal.c}C · {meal.f}F
      </div>
    </div>
  );
}
