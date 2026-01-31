
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

import { RosterContext } from '../context/RosterContext';

const DashboardScreen = ({ navigation, route }) => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [posFilter, setPosFilter] = useState('ALL');
    const [selectedWeek, setSelectedWeek] = useState(16); // Default to Week 16
    const [currentWeek, setCurrentWeek] = useState(null);
    const { addToRoster, removeFromRoster, roster, totalSalary, canAddPlayer } = useContext(RosterContext);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            console.log(`Fetching players for Week ${selectedWeek}...`);
            // Pass selectedWeek to API
            const res = await api.get('/players', {
                params: {
                    year: 2025,
                    week: selectedWeek,
                    _: Date.now()
                }
            });

            // Handle new { meta, data } format or legacy [...] format
            let data = res.data;
            let meta = {};

            if (!Array.isArray(data) && data.data) {
                meta = data.meta || {};
                data = data.data;
            }

            setPlayers(data);
            setFilteredPlayers(data);
            if (meta.week) {
                setCurrentWeek(meta.week);
            }
        } catch (e) {
            console.error(e);
            alert("Error fetching players: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Update Title with Week
    useEffect(() => {
        navigation.setOptions({ title: `Dashboard : Week ${selectedWeek}` });
    }, [navigation, selectedWeek]);

    // Fetch on mount and when selectedWeek changes
    useEffect(() => {
        fetchPlayers();
    }, [selectedWeek]);

    // Listen for navigation parameters (from Roster Screen)
    useEffect(() => {
        if (route.params?.initialFilter) {
            setPosFilter(route.params.initialFilter);
        }
    }, [route.params]);

    // Apply Filters
    useEffect(() => {
        let result = players;

        // 1. Position Filter
        if (posFilter !== 'ALL') {
            if (posFilter === 'FLEX') {
                // Flex can be RB, WR, TE
                result = result.filter(p => ['RB', 'WR', 'TE'].includes(p.Position));
            } else {
                result = result.filter(p => p.Position === posFilter);
            }
        }

        // 2. Search Filter
        if (search) {
            const term = search.toLowerCase();
            result = result.filter(p =>
                (p.First_Name && p.First_Name.toLowerCase().includes(term)) ||
                (p.Last_Name && p.Last_Name.toLowerCase().includes(term)) ||
                (p.Team && p.Team.toLowerCase().includes(term))
            );
        }

        setFilteredPlayers(result);
    }, [players, posFilter, search]);

    const isPlayerInRoster = (player) => {
        return roster.find(p => p.id === player.Id);
    };

    const renderItem = ({ item }) => {
        const inRoster = isPlayerInRoster(item);

        let addable = true;
        try {
            addable = canAddPlayer(item);
        } catch (e) {
            console.error(e);
            addable = false;
        }

        return (
            <View style={[styles.card, inRoster && styles.cardSelected]}>
                <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {inRoster ? (
                            <TouchableOpacity onPress={() => removeFromRoster(item.Id)} style={styles.removeBtn}>
                                <Text style={styles.removeBtnText}>×</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => addable && addToRoster(item)}
                                style={[styles.addBtn, !addable && styles.disabledBtn]}
                                disabled={!addable}
                            >
                                <Text style={styles.addBtnText}>+</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={[styles.pos, !addable && !inRoster && styles.disabledText]}>{item.Position}</Text>
                        <Text style={[styles.name, !addable && !inRoster && styles.disabledText]}>{item.First_Name} {item.Last_Name}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <Text style={styles.info}>{item.Team} vs {item.Opponent}</Text>
                    <Text style={styles.salary}>${item.Salary}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.stat}>FPPG: {item.FPPG ? Number(item.FPPG).toFixed(1) : '0.0'}</Text>
                    {item.Injury_Indicator && <Text style={styles.injury}>{item.Injury_Indicator}</Text>}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.filters}>
                {/* Week Selector */}
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 }}>Select Week:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {[13, 14, 15, 16, 17, 18].map(week => (
                            <TouchableOpacity
                                key={week}
                                style={[
                                    styles.posBtn,
                                    selectedWeek === week && styles.posBtnActive,
                                    { marginRight: 5, marginBottom: 5 }
                                ]}
                                onPress={() => setSelectedWeek(week)}
                            >
                                <Text style={[styles.posText, selectedWeek === week && styles.posTextActive]}>
                                    W{week}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.headerRow}>
                    <TextInput
                        style={styles.search}
                        placeholder="Search players..."
                        value={search}
                        onChangeText={setSearch}
                    />
                    <Text style={[styles.salaryCap, totalSalary > 60000 && styles.overCap]}>
                        ${(60000 - totalSalary).toLocaleString()}
                    </Text>
                </View>
                <View style={styles.posRow}>
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'D'].map(pos => (
                        <TouchableOpacity
                            key={pos}
                            style={[styles.posBtn, posFilter === pos && styles.posBtnActive]}
                            onPress={() => setPosFilter(pos)}
                        >
                            <Text style={[styles.posText, posFilter === pos && styles.posTextActive]}>{pos}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={filteredPlayers}
                    keyExtractor={item => item.Id.toString()}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    filters: { padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    search: { backgroundColor: '#f9f9f9', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee', flex: 1, marginRight: 10 },
    salaryCap: { fontSize: 16, fontWeight: 'bold', color: 'green' },
    overCap: { color: 'red' },
    posRow: { flexDirection: 'row', justifyContent: 'space-around' },
    posBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 15, borderWidth: 1, borderColor: '#ccc' },
    posBtnActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
    posText: { fontSize: 12, color: '#333' },
    posTextActive: { color: '#fff' },
    card: { backgroundColor: '#fff', padding: 12, marginHorizontal: 10, marginVertical: 4, borderRadius: 8 },
    cardSelected: { backgroundColor: '#e6fffa', borderColor: '#10b981', borderWidth: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    name: { fontWeight: 'bold', fontSize: 16 },
    pos: { backgroundColor: '#eee', paddingHorizontal: 6, borderRadius: 4, fontSize: 12, overflow: 'hidden' },
    info: { color: '#666', fontSize: 12 },
    salary: { fontWeight: 'bold', color: 'green' },
    stat: { fontSize: 12, fontWeight: '600' },
    injury: { color: 'red', fontSize: 10, fontWeight: 'bold' },
    addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, lineHeight: 22 },
    disabledBtn: { backgroundColor: '#ccc' },
    disabledText: { color: '#999' },
    removeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    removeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, lineHeight: 22 }
});

export default DashboardScreen;
