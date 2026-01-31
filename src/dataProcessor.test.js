
import { describe, it, expect } from 'vitest';
import { parseCSV, filterPlayers, sortPlayers } from './dataProcessor';

// Mock Data
const mockCSV = `Id,Position,First Name,Nickname,Last Name,FPPG,Played,Salary,Game,Team,Opponent,Injury Indicator,Injury Details
1,QB,Josh,Josh Allen,Allen,25.0,13,9000,BUF@NE,BUF,NE,,
2,WR,Tyreek,Tyreek Hill,Hill,22.0,13,8500,MIA@NYJ,MIA,NYJ,Q,Ankle
3,RB,Derrick,Derrick Henry,Henry,18.0,13,8000,TEN@JAC,TEN,JAC,,
4,TE,Travis,Travis Kelce,Kelce,15.0,13,7500,KC@LV,KC,LV,,
5,D,Bills,Buffalo Bills,Bills,10.0,13,4000,BUF@NE,BUF,NE,,`;

describe('FanDuel Analysis Logic', () => {

    describe('parseCSV', () => {
        it('should parse valid CSV string into player objects', () => {
            const players = parseCSV(mockCSV);
            expect(players).toHaveLength(5);
            expect(players[0].name).toBe('Josh Allen');
            expect(players[0].pos).toBe('QB');
            expect(players[0].salary).toBe(9000);
        });

        it('should calculate value score correctly (FPPG / Salary * 1000)', () => {
            const players = parseCSV(mockCSV);
            // Josh Allen: 25.0 / 9000 * 1000 = 2.777...
            expect(players[0].value).toBeCloseTo(2.778, 3);

            // Bills Def: 10.0 / 4000 * 1000 = 2.5
            expect(players[4].value).toBe(2.5);
        });

        it('should handle empty input gracefully', () => {
            expect(parseCSV('')).toEqual([]);
        });
    });

    describe('filterPlayers', () => {
        const players = parseCSV(mockCSV);

        it('should filter by Position', () => {
            const qbs = filterPlayers(players, { position: 'QB', maxSalary: 10000, search: '' });
            expect(qbs).toHaveLength(1);
            expect(qbs[0].name).toBe('Josh Allen');
        });

        it('should filter by Max Salary', () => {
            const cheapPlayers = filterPlayers(players, { position: 'ALL', maxSalary: 8000, search: '' });
            expect(cheapPlayers).toHaveLength(3); // Henry, Kelce, Bills
            expect(cheapPlayers.map(p => p.name)).not.toContain('Josh Allen');
        });

        it('should filter by Search Term (Case Insensitive)', () => {
            const result = filterPlayers(players, { position: 'ALL', maxSalary: 10000, search: 'hill' });
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Tyreek Hill');
        });
    });

    describe('sortPlayers', () => {
        const players = parseCSV(mockCSV);

        it('should sort by Salary Descending', () => {
            const sorted = sortPlayers(players, 'salary-desc');
            expect(sorted[0].name).toBe('Josh Allen'); // 9000
            expect(sorted[4].name).toBe('Buffalo Bills'); // 4000
        });

        it('should sort by Value Descending', () => {
            const sorted = sortPlayers(players, 'value-desc');
            // Tyreek Hill: 22/8.5 = 2.58
            // Josh Allen: 2.77
            // Derrick Henry: 18/8 = 2.25
            expect(sorted[0].name).toBe('Josh Allen');
        });
    });
});
