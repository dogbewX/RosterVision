
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { RosterContext } from '../context/RosterContext';
import api from '../services/api';

const RosterScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const { roster, removeFromRoster, saveRosterToBackend, totalSalary, loading } = useContext(RosterContext);

    // No local state or fetch needed - accessing shared context
    // Roster is loaded by Provider on init

    // const calculateTotalSalary = ... (Already in context as totalSalary)

    const SLOT_ORDER = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'D'];

    const getDisplayData = () => {
        const display = [];
        const usedIds = new Set();

        SLOT_ORDER.forEach(slot => {
            let foundPlayer = null;

            if (slot === 'FLEX') {
                // For FLEX, try to find any remaining player that can be flexed (RB, WR, TE)
                foundPlayer = roster.find(p =>
                    (p.pos === 'RB' || p.pos === 'WR' || p.pos === 'TE') &&
                    !usedIds.has(p.id)
                );
                if (foundPlayer) {
                    // Mark as flex for display purposes
                    foundPlayer = { ...foundPlayer, isFlex: true };
                }
            } else {
                // Try to find a player specifically for this slot
                foundPlayer = roster.find(p => p.pos === slot && !usedIds.has(p.id));
            }

            if (foundPlayer) {
                display.push(foundPlayer);
                usedIds.add(foundPlayer.id);
            } else {
                display.push({ empty: true, pos: slot, id: `empty-${slot}-${Math.random()}` });
            }
        });

        // Add any remaining players that didn't fit into a specific slot (e.g., extra QB if only one QB slot)
        // This part might need refinement based on exact roster rules (e.g., if only 1 QB is allowed, others are ignored)
        // For now, we'll just ensure the 8 slots are filled as per SLOT_ORDER.
        // If roster has more than 8 players, the extras won't be displayed here.
        // If roster has fewer than 8, empty slots will be shown.

        return display;
    };

    const displayData = getDisplayData();

    const renderItem = ({ item }) => {
        if (item.empty) {
            return (
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { initialFilter: item.pos })}>
                    <View style={[styles.card, styles.emptyCard]}>
                        <View style={styles.row}>
                            <View style={[styles.removeBtn, { backgroundColor: '#ccc' }]}>
                                {/* Placeholder circle */}
                            </View>
                            <Text style={[styles.posBadge, styles.emptyBadge]}>{item.pos}</Text>
                            <Text style={styles.emptyText}>Empty {item.pos} Slot</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.card}>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => removeFromRoster(item.id)} style={styles.removeBtn}>
                        <Text style={styles.removeBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.posBadge}>{item.isFlex ? 'FLEX' : item.pos}</Text>
                    <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.game}>{item.game}</Text>
                    </View>
                </View>
                <Text style={styles.salary}>${item.salary.toLocaleString()}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Roster ({roster.length}/8)</Text>
                <Button title={loading ? "Saving..." : "Save Roster"} onPress={saveRosterToBackend} disabled={loading} />
            </View>
            <View style={styles.stats}>
                <Text>Salary: ${totalSalary.toLocaleString()} / $60,000</Text>
            </View>

            <FlatList
                data={displayData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );

};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0', padding: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 20, fontWeight: 'bold' },
    stats: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10 },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 8 },
    row: { flexDirection: 'row', alignItems: 'center' },
    posBadge: { width: 40, textAlign: 'center', backgroundColor: '#eee', padding: 4, borderRadius: 4, marginRight: 10, fontSize: 12, fontWeight: 'bold' },
    name: { fontWeight: '600', fontSize: 15 },
    game: { fontSize: 11, color: '#666' },
    salary: { fontWeight: 'bold', color: 'green' },
    empty: { textAlign: 'center', marginTop: 20, color: '#888' },
    removeBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    removeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, lineHeight: 18 },
    emptyCard: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', backgroundColor: 'transparent' },
    emptyBadge: { backgroundColor: 'transparent', color: '#999', borderWidth: 1, borderColor: '#ccc' },
    emptyText: { color: '#999', fontStyle: 'italic' }
});

export default RosterScreen;
