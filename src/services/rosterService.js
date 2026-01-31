import config from '../config.js';

const ROSTER_PREFIX = 'fd_roster_';

// Standard FanDuel NFL Roster Composition
const MAX_POSITIONS = {
    'QB': 1,
    'RB': 2,
    'WR': 2, // User requested 2 WR
    'TE': 1,
    'D': 1
};

const MAX_ROSTER_SIZE = 8; // 1 QB + 2 RB + 2 WR + 1 TE + 1 Flex + 1 D
const SALARY_CAP = config.SALARY_CAP;

export const rosterService = {
    getRosterKey(username) {
        return `${ROSTER_PREFIX}${username}`;
    },

    async getRoster(userId) {
        if (!userId) return [];
        try {
            // Fetch the players from the LATEST roster for this user
            const response = await fetch(`/api/rosters/latest/${userId}`);
            if (!response.ok) return [];
            const players = await response.json();
            return players;
        } catch (e) {
            console.error("Failed to fetch roster", e);
            return [];
        }
    },

    async saveRoster(userId, roster) {
        if (!userId) return;

        const entries = roster.map(p => ({
            playerId: p.id,
            slotType: p.isFlex ? 'FLEX' : p.pos
        }));

        const name = "My Roster " + new Date().toLocaleString();

        if (roster.length < MAX_ROSTER_SIZE) {
            alert(`Roster is incomplete! You need ${MAX_ROSTER_SIZE} players.`);
            return;
        }

        await fetch('/api/rosters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, entries, name })
        });
    },

    addPlayer(username, player, currentRoster, isFlex = false) {
        if (currentRoster.length >= MAX_ROSTER_SIZE) {
            throw new Error(`Roster is full (${MAX_ROSTER_SIZE} players).`);
        }

        if (currentRoster.find(p => p.id === player.id)) {
            throw new Error('Player is already in roster.');
        }

        const currentSalary = currentRoster.reduce((sum, p) => sum + p.salary, 0);
        if (currentSalary + player.salary > SALARY_CAP) {
            throw new Error(`Salary cap exceeded! Remaining: $${(SALARY_CAP - currentSalary).toLocaleString()}`);
        }

        const newPlayer = { ...player, isFlex };

        // Validate Composition (including Flex logic)
        if (!this.isValidComposition([...currentRoster, newPlayer])) {
            throw new Error("Cannot add player: Position limit reached or Roster Invalid.");
        }

        return [...currentRoster, newPlayer];
    },

    isValidComposition(roster) {
        // Priority: Fill Explicit Flex spots first
        const limits = { ...MAX_POSITIONS };
        let flexOpen = true; // Only 1 Flex allowed

        // First pass: consume explicit flex players
        const unassignedPlayers = [];
        for (const p of roster) {
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
    },

    canAddPosition(currentRoster, position, isFlexMode = false) {
        if (currentRoster.length >= MAX_ROSTER_SIZE) return false;

        if (isFlexMode) {
            const flexTaken = currentRoster.some(p => p.isFlex);
            // Simplified check based on original logic intent

            if (!['RB', 'WR', 'TE'].includes(position)) return false;

            // Simulate adding as Flex
            const testRoster = [...currentRoster, { pos: position, isFlex: true }];
            return this.isValidComposition(testRoster);
        }

        // Standard Primary Check
        const counts = currentRoster.reduce((acc, p) => {
            if (!p.isFlex) {
                acc[p.pos] = (acc[p.pos] || 0) + 1;
            }
            return acc;
        }, {});

        const currentCount = counts[position] || 0;
        const limit = MAX_POSITIONS[position] || 0;

        return currentCount < limit;
    },

    removePlayer(username, playerId, currentRoster) {
        return currentRoster.filter(p => p.id !== playerId);
    }
};
