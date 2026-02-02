import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { addStudent } from '../services/attendanceService';
import { useNavigation } from '@react-navigation/native';

export default function AddStudentScreen() {
    const [name, setName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [className, setClassName] = useState('Class 10A'); // Default for now
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleAdd = async () => {
        if (!name || !rollNo) {
            Alert.alert('Error', 'Please enter Name and Roll No');
            return;
        }
        setLoading(true);
        try {
            await addStudent(name, rollNo, className);
            Alert.alert('Success', 'Student added!', [
                { text: 'Add Another', onPress: () => { setName(''); setRollNo(''); } },
                { text: 'Done', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Student</Text>

            <TextInput
                style={styles.input}
                placeholder="Student Name"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Roll Number"
                value={rollNo}
                onChangeText={setRollNo}
            />

            <TextInput
                style={styles.input}
                placeholder="Class Name"
                value={className}
                onChangeText={setClassName}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleAdd}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Add Student</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
