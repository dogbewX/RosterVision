
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RosterContext } from '../context/RosterContext';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const { roster, totalSalary } = useContext(RosterContext);

    // Calculate dynamic stats
    const playerCount = roster.length;
    const remainingSalary = 60000 - totalSalary;

    // Determine status
    const isFull = playerCount === 8;
    const isEmpty = playerCount === 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
                <Text style={styles.subText}>Roster Vision</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Current Roster Status</Text>

                {isEmpty ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.statusText}>No active roster found.</Text>
                        <Text style={styles.statusSub}>Get started by picking your team.</Text>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('Dashboard')}
                        >
                            <Text style={styles.btnText}>+ Create New Roster</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.activeState}>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Players Selected</Text>
                            <Text style={styles.statValue}>{playerCount} / 8</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Salary Remaining</Text>
                            <Text style={[styles.statValue, { color: remainingSalary < 0 ? 'red' : 'green' }]}>
                                ${remainingSalary.toLocaleString()}
                            </Text>
                        </View>

                        {isFull ? (
                            <View style={styles.alertBox}>
                                <Text style={styles.alertText}>Roster Complete!</Text>
                            </View>
                        ) : (
                            <Text style={styles.hint}>You need {8 - playerCount} more players.</Text>
                        )}

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('My Roster')}
                        >
                            <Text style={styles.btnText}>View Roster</Text>
                        </TouchableOpacity>

                        {!isFull && (
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.secondaryBtn]}
                                onPress={() => navigation.navigate('Dashboard')}
                            >
                                <Text style={[styles.btnText, styles.secondaryText]}>Continue Building</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20, justifyContent: 'center' },
    header: { marginBottom: 30, alignItems: 'center' },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
    subText: { fontSize: 16, color: '#666', marginTop: 5 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    emptyState: { alignItems: 'center', paddingVertical: 10 },
    statusText: { fontSize: 16, color: '#666', marginBottom: 5 },
    statusSub: { fontSize: 14, color: '#999', marginBottom: 20 },
    activeState: { width: '100%' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    statLabel: { fontSize: 16, color: '#666' },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    actionBtn: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, width: '100%' },
    secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#10b981', marginTop: 10 },
    btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    secondaryText: { color: '#10b981' },
    alertBox: { backgroundColor: '#e6fffa', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
    alertText: { color: '#10b981', fontWeight: 'bold' },
    hint: { textAlign: 'center', color: '#666', marginBottom: 15, fontStyle: 'italic' },
    logoutBtn: { marginTop: 30, alignItems: 'center', padding: 10 },
    logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' }
});

export default HomeScreen;
