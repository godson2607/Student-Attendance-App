import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getAttendanceHistory } from '../services/attendanceService';
import { useRoute } from '@react-navigation/native';

export default function ViewAttendanceScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const route = useRoute();
    const className = route.params?.className || 'Class 10A';

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getAttendanceHistory(className);
            // Sort by date descending
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setHistory(sortedData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const presentCount = item.records.filter(r => r.status === 'present').length;
        const totalCount = item.records.length;
        const percentage = ((presentCount / totalCount) * 100).toFixed(1);

        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.date}>{item.date}</Text>
                    <Text style={styles.stats}>{presentCount}/{totalCount} Present</Text>
                </View>
                <Text style={styles.percentage}>{percentage}% Attendance</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>History - {className}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>No attendance records found.</Text>}
                    contentContainerStyle={styles.listContainer}
                />
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
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    stats: {
        fontSize: 14,
        color: '#666',
    },
    percentage: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        fontSize: 16,
    },
});
