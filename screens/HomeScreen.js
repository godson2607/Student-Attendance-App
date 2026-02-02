import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation();

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Student Attendance Dashboard</Text>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('MarkAttendance', { className: 'Class 10A' })}
            >
                <Text style={styles.cardTitle}>Mark Attendance</Text>
                <Text style={styles.cardSubtitle}>Class 10A</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.card, { backgroundColor: '#34C759' }]}
                onPress={() => navigation.navigate('ViewAttendance', { className: 'Class 10A' })}
            >
                <Text style={styles.cardTitle}>View History</Text>
                <Text style={styles.cardSubtitle}>Class 10A</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.card, { backgroundColor: '#5856D6' }]}
                onPress={() => navigation.navigate('AddStudent')}
            >
                <Text style={styles.cardTitle}>Add Student</Text>
                <Text style={styles.cardSubtitle}>+ New Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#ff3b30',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#007AFF',
        padding: 20,
        borderRadius: 15,
        width: '80%',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 5,
    },
});
