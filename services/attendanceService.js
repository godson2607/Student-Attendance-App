import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, Timestamp, updateDoc, doc } from 'firebase/firestore';

// Collection References
const STUDENTS_COLLECTION = 'students';
const ATTENDANCE_COLLECTION = 'attendance';

/**
 * Adds a new student to the database
 * @param {string} name - Student Name
 * @param {string} rollNo - Student Roll Number
 * @param {string} className - Class/Grade
 */
export const addStudent = async (name, rollNo, className) => {
    try {
        const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), {
            name,
            rollNo,
            className,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding student: ", error);
        throw error;
    }
};

/**
 * Fetches all students for a specific class
 * @param {string} className 
 */
export const getStudentsByClass = async (className) => {
    try {
        const q = query(collection(db, STUDENTS_COLLECTION), where("className", "==", className));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting students: ", error);
        throw error;
    }
};

/**
 * Marks attendance for a list of students
 * @param {string} className 
 * @param {string} date - ISO Date string (YYYY-MM-DD)
 * @param {Array} attendanceData - Array of { studentId, status: 'present'|'absent', name, rollNo }
 */
export const markAttendance = async (className, date, attendanceData) => {
    try {
        // Create a single document for the class attendance for that day
        // Structure: { className, date, records: [...], createdAt }
        const attendanceRecord = {
            className,
            date,
            records: attendanceData,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceRecord);
        return docRef.id;
    } catch (error) {
        console.error("Error marking attendance: ", error);
        throw error;
    }
};

/**
 * Gets attendance history for a class
 */
export const getAttendanceHistory = async (className) => {
    try {
        const q = query(collection(db, ATTENDANCE_COLLECTION), where("className", "==", className));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching history: ", error);
        throw error;
    }
};
