# Student Attendance App - Line-by-Line Code Explanation

This guide provides a detailed explanation of the project's code, suitable for presenting to a supervisor or guide.

---

## 1. `firebaseConfig.js`
**Purpose**: connects your React Native app to the Firebase backend services.

```javascript
// Import the core function to initialize the Firebase app
import { initializeApp } from 'firebase/app';

// Import Auth functions: 'initializeAuth' for setup, 'getReactNativePersistence' for saving login state
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// Import Firestore function to connect to the database
import { getFirestore } from 'firebase/firestore';

// Import AsyncStorage to save data to the phone's local storage (needed for keeping user logged in)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration object with unique keys from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAz...", // Identifies your project to Google
  authDomain: "attendanceapp...", // Domain for auth redirects
  projectId: "attendanceapp...", // Unique ID for your Firebase project
  // ... other identifiers
};

// Initialize the specific Firebase App instance with the config above
const app = initializeApp(firebaseConfig);

// Initialize Authentication logic
// We pass 'persistence: getReactNativePersistence(AsyncStorage)' instructing Firebase 
// to use the phone's native storage to remember the user's session even if the app closes.
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize the Cloud Firestore database instance linked to the app
const db = getFirestore(app);

// Export 'auth' and 'db' so functionality can be imported in other screens
export { auth, db };
```

---

## 2. `App.js`
**Purpose**: The main entry point. It handles Navigation (moving between screens) and Authentication State (checking if user is logged in).

```javascript
// React Navigation components to handle screen switching
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Core React hooks for managing state (data) and side effects (actions like checking login)
import { useEffect, useState } from 'react';
// Firebase listener to detect login/logout changes
import { onAuthStateChanged } from 'firebase/auth';
// Our configured auth instance
import { auth } from './firebaseConfig';

// Import all the screens we created
import LoginScreen from './screens/LoginScreen';
// ... other screen imports

// Create a Stack Navigator instance
const Stack = createStackNavigator();

export default function App() {
  // 'user': State variable to hold the logged-in user object (null if logged out)
  const [user, setUser] = useState(null);
  
  // 'loading': State to show a spinner while we check if the user is already logged in
  const [loading, setLoading] = useState(true);

  // useEffect runs ONCE when the app starts
  useEffect(() => {
    // onAuthStateChanged listens for changes. It returns an 'unsubscribe' function.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // If logged in, 'user' is populated. If logged out, it's null.
      setLoading(false); // We have checked, so stop loading.
    });
    // Cleanup: When App component unmounts (closes), stop listening.
    return unsubscribe;
  }, []);

  // Display a loading spinner if we are still checking local storage for credentials
  if (loading) {
    return ( ... <ActivityIndicator /> ... );
  }

  // Main UI Render
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* navigator without a header bar */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* CONDITIONAL RENDERING: LOGIC */}
          {user ? (
            // IF User is logged in, show the App Screens
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
              ...
            </>
          ) : (
            // ELSE (User is NOT logged in), show Auth Screens
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

---

## 3. `services/attendanceService.js`
**Purpose**: Separates the database logic from the UI. Contains function to Read/Write to Firestore.

```javascript
// Get database reference
import { db } from '../firebaseConfig';
// Import specific Firestore methods
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

// Define Collection Names (like Tables in SQL)
const STUDENTS_COLLECTION = 'students';
const ATTENDANCE_COLLECTION = 'attendance';

// Function 1: Add Student
export const addStudent = async (name, rollNo, className) => {
  try {
    // Add a new document to 'students' collection
    const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), {
      name,      // field: name
      rollNo,    // field: rollNo
      className, // field: class name (for filtering)
      createdAt: Timestamp.now(), // Store time of creation
    });
    return docRef.id; // Return generated ID
  } catch (error) { ... }
};

// Function 2: Get Students
export const getStudentsByClass = async (className) => {
  try {
    // Create a Query: Select * FROM students WHERE className == '10A'
    const q = query(collection(db, STUDENTS_COLLECTION), where("className", "==", className));
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Map the results to a clean array of objects with IDs
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) { ... }
};

// Function 3: Mark Attendance
export const markAttendance = async (className, date, attendanceData) => {
  try {
    // Create one document representing 'Attendance for Class X on Date Y'
    const attendanceRecord = {
      className,
      date,
      // 'records' is an array inside the document: [{studentId: 1, status: 'present'}, ...]
      records: attendanceData, 
      createdAt: Timestamp.now(),
    };
    // Save to Firestore
    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceRecord);
    return docRef.id;
  } catch (error) { ... }
};
```

---

## 4. `screens/LoginScreen.js`
**Purpose**: Handles user login via Email or Google.

```javascript
// Import Google Auth helpers from Expo
import * as Google from 'expo-auth-session/providers/google';

export default function LoginScreen() {
  // Setup Google Auth Request hook
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // Client IDs link this app to your Google Cloud project
    webClientId: '...',
    androidClientId: '...', 
  });

  // Watch for Google response
  useEffect(() => {
    // If Google login succeeded on the phone...
    if (response?.type === 'success') {
      const { id_token } = response.params; // Get the Google Token
      
      // Create a Firebase Credential from that Google Token
      const credential = GoogleAuthProvider.credential(id_token);
      
      // Sign in to Firebase with that credential
      signInWithCredential(auth, credential)
        .catch((error) => ... ); // Handle errors
    }
  }, [response]);

  // Standard Email/Password Login Function
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) ... 
    
    // Call Firebase Auth
    await signInWithEmailAndPassword(auth, email, password);
    // Note: No navigation needed here because App.js detects the login and switches screens automatically
  };

  return ( ... UI Code ... );
}
```

## 5. `screens/MarkAttendanceScreen.js`
**Purpose**: The core feature. Displays students and toggles their status.

```javascript
export default function MarkAttendanceScreen() {
  // State for list of students
  const [students, setStudents] = useState([]);
  
  // Load students when screen opens
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    // Call our service to get data from Firestore
    const data = await getStudentsByClass(className);
    
    // Transform data: Add a local 'status' field to each student, default to 'present' # GREEN
    const studentsWithStatus = data.map(s => ({ ...s, status: 'present' }));
    
    setStudents(studentsWithStatus);
  };

  // Toggle Function: Called when Switch is clicked
  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => 
      // If ID matches, flip 'present' <-> 'absent'
      s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
    ));
  };

  // Submit Function
  const handleSubmit = async () => {
    // Get current date YYYY-MM-DD
    const date = new Date().toISOString().split('T')[0]; 
    
    // Prepare concise data for saving
    const attendanceData = students.map(({ id, name, rollNo, status }) => ({
      studentId: id, name, rollNo, status
    }));

    // Save to Firestore via service
    await markAttendance(className, date, attendanceData);
  };

  // Render a FlatList (efficient list) of students
  return (
    <FlatList 
       data={students}
       renderItem={({ item }) => (
         // Each row has a Name, Roll No, and a Switch component
         <View>
            <Text>{item.name}</Text>
            <Switch value={item.status === 'present'} ... />
         </View>
       )}
    />
  );
}
```
