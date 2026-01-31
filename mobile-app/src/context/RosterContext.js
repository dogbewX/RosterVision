
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const RosterContext = createContext();

export const MAX_POSITIONS = {
    'QB': 1,
    'RB': 2,
    'WR': 2,
    'TE': 1,
    'D': 1
};
export const MAX_ROSTER_SIZE = 8;
const SALARY_CAP = 60000;

export const isValidComposition = (testRoster) => {
    // Priority: Fill Explicit Flex spots first
    const limits = { ...MAX_POSITIONS };
    let flexOpen = true; // Only 1 Flex allowed

    // First pass: consume explicit flex players
    const unassignedPlayers = [];
    for (const p of testRoster) {
        if (p.isFlex) {
            if (flexOpen && ['RB', 'WR', 'TE'].includes(p.pos)) {
                flexOpen = false;
            } else {
                return false; // Flex already taken or invalid pos
            }
        } else {
            unassignedPlayers.push(p);
        }
    }

    // Second pass: fill primary slots
    const stillUnassigned = [];
    for (const p of unassignedPlayers) {
        if (limits[p.pos] > 0) {
            limits[p.pos]--;
        } else {
            stillUnassigned.push(p);
        }
    }

    // Third pass: fill remaining allowed flex (if not taken by explicit flex)
    for (const p of stillUnassigned) {
        if (flexOpen && ['RB', 'WR', 'TE'].includes(p.pos)) {
            flexOpen = false;
        } else {
            return false; // No room
        }
    }

    return true;
};

export const RosterProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        if (user) {
            loadRoster();
        }
    }, [user]);

    const loadRoster = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/rosters/latest/${user.id}`);
            // Ensure data consistency with web format (id, pos, salary, etc.)
            // Mobile API might return 'Id', 'Position' etc if raw, 
            // but the /latest endpoint maps to { id, pos, name ... }
            if (Array.isArray(res.data)) {
                setRoster(res.data);
            }
        } catch (e) {
            console.error("Failed to load roster", e);
        } finally {
            setLoading(false);
        }
    };

    const canAddPlayer = (player) => {
        // 1. Size
        if (roster.length >= MAX_ROSTER_SIZE) return false;

        // 2. Duplicate
        const playerId = player.Id || player.id;
        if (roster.find(p => p.id === playerId)) return false;

        // 3. Salary
        const currentSalary = totalSalary;
        const playerSalary = player.Salary || player.salary;
        if (currentSalary + playerSalary > SALARY_CAP) return false;

        // 4. Position / Flex
        const playerPos = player.Position || player.pos;
        const currentPrimaryCount = roster.filter(p => p.pos === playerPos && !p.isFlex).length;
        const maxPrimary = MAX_POSITIONS[playerPos] || 0;

        let isFlex = false;
        if (currentPrimaryCount >= maxPrimary) {
            isFlex = true;
        }

        const newPlayer = {
            id: playerId,
            name: player.First_Name || player.name, // Simplified for check
            pos: playerPos,
            salary: playerSalary,
            isFlex: isFlex
        };

        const testRoster = [...roster, newPlayer];
        return isValidComposition(testRoster);
    };

    const addToRoster = (player) => {
        // Validation 1: Size
        if (roster.length >= MAX_ROSTER_SIZE) {
            Alert.alert("Roster Full", `Max ${MAX_ROSTER_SIZE} players allowed.`);
            return;
        }

        // Validation 2: Duplicates
        // Note: web uses p.id, mobile player list uses p.Id (capitalized from view)
        // We normalize to 'id' for roster state
        const playerId = player.Id || player.id;
        if (roster.find(p => p.id === playerId)) {
            Alert.alert("Duplicate", "Player is already in your roster.");
            return;
        }

        // Validation 3: Salary
        const currentSalary = roster.reduce((sum, p) => sum + p.salary, 0);
        const playerSalary = player.Salary || player.salary;
        if (currentSalary + playerSalary > SALARY_CAP) {
            Alert.alert("Salary Cap", `Adding this player exceeds the $60,000 cap.`);
            return;
        }

        const playerPos = player.Position || player.pos;

        // Smart Flex Detection: Check if we need to use the Flex spot
        // Count how many players of this position are filling PRIMARY slots (not explicitly Flex)
        // Note: For now, we assume existing players with isFlex=false are primary.
        const currentPrimaryCount = roster.filter(p => p.pos === playerPos && !p.isFlex).length;
        const maxPrimary = MAX_POSITIONS[playerPos] || 0;

        let isFlex = false;
        if (currentPrimaryCount >= maxPrimary) {
            // Primary slots full, try Flex
            isFlex = true;
        }

        // Transform to Standard Roster Object
        const newPlayer = {
            id: playerId,
            name: `${player.First_Name || player.first_name || ''} ${player.Last_Name || player.last_name || ''}`.trim() || player.name,
            pos: playerPos,
            salary: playerSalary,
            team: player.Team || player.team,
            opponent: player.Opponent || player.opponent,
            game: player.game || `${player.Team} vs ${player.Opponent}`,
            fppg: player.FPPG || player.fppg,
            isFlex: isFlex
        };

        const testRoster = [...roster, newPlayer];

        if (!isValidComposition(testRoster)) {
            if (isFlex) {
                Alert.alert("Roster Invalid", "Flex spot is taken or position invalid for Flex.");
            } else {
                Alert.alert("Limit Reached", `You have enough ${newPlayer.pos}s and Flex is invalid or taken.`);
            }
            return;
        }

        setRoster(testRoster);
    };

    const removeFromRoster = (playerId) => {
        setRoster(prev => prev.filter(p => p.id !== playerId));
    };


    const saveRosterToBackend = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (roster.length < MAX_ROSTER_SIZE) {
                Alert.alert("Incomplete Roster", `You must have ${MAX_ROSTER_SIZE} players to save.`);
                setLoading(false);
                return;
            }

            const entries = roster.map(p => ({
                playerId: p.id,
                slotType: p.isFlex ? 'FLEX' : p.pos
            }));

            const name = "Mobile Roster " + new Date().toLocaleString();

            await api.post('/rosters', { userId: user.id, entries, name });
            Alert.alert("Success", "Roster saved successfully!");
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save roster.");
        } finally {
            setLoading(false);
        }
    };

    const totalSalary = roster.reduce((sum, p) => sum + p.salary, 0);

    return (
        <RosterContext.Provider value={{
            roster,
            addToRoster,
            removeFromRoster,
            saveRosterToBackend,
            totalSalary,
            canAddPlayer,
            loading
        }}>
            {children}
        </RosterContext.Provider>
    );
};
