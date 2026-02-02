import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { getStudentsByClass, markAttendance } from '../services/attendanceService';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MarkAttendanceScreen() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Assuming we get className from params or default
    const route = useRoute();
    const className = route.params?.className || 'Class 10A';

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            // For demo purposes, if no students exist, we might want to show empty state or add dummies
            // In real app, you'd add students via another screen
            const data = await getStudentsByClass(className);

            // Initialize with 'present' status by default
            const studentsWithStatus = data.map(s => ({ ...s, status: 'present' }));
            setStudents(studentsWithStatus);
        } catch (error) {
            Alert.alert('Error', 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (id) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
        ));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            const attendanceData = students.map(({ id, name, rollNo, status }) => ({
                studentId: id,
                name,
                rollNo,
                status
            }));

            await markAttendance(className, date, attendanceData);
            Alert.alert('Success', 'Attendance marked successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const navigation = useNavigation();

    const renderItem = ({ item }) => (
        <View style={styles.studentCard}>
            <View>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.rollNo}>Roll No: {item.rollNo}</Text>
            </View>
            <View style={styles.statusContainer}>
                <Text style={[
                    styles.statusText,
                    { color: item.status === 'present' ? 'green' : 'red' }
                ]}>
                    {item.status.toUpperCase()}
                </Text>
                <Switch
                    value={item.status === 'present'}
                    onValueChange={() => toggleStatus(item.id)}
                    trackColor={{ false: "#ffdddd", true: "#ddffdd" }}
                    thumbColor={item.status === 'present' ? "#28a745" : "#dc3545"}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mark Attendance - {className}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <>
                    <FlatList
                        data={students}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        ListEmptyComponent={<Text style={styles.emptyText}>No students found in this class.</Text>}
                        contentContainerStyle={styles.listContainer}
                    />

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={submitting || students.length === 0}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitText}>Submit Attendance</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    studentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
    },
    rollNo: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    submitButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        fontSize: 16,
    },
});
