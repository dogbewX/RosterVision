
import { describe, it, expect } from 'vitest';
import { parseCSVForImport } from './dataProcessor.js';

describe('Admin Import Validation', () => {
    it('should throw error if required headers are missing', () => {
        const invalidCSV = `Id,Nickname,Position
1,Josh Allen,QB`;
        expect(() => parseCSVForImport(invalidCSV)).toThrow(/Missing headers/);
    });

    it('should pass with valid headers and return server format', () => {
        const validCSV = `Id,First Name,Last Name,Position,Salary,FPPG,Team,Opponent,Injury Indicator,Injury Details
1,Josh,Allen,QB,9000,25.0,BUF,NE,,`;

        const result = parseCSVForImport(validCSV);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            Id: '1',
            First_Name: 'Josh',
            Last_Name: 'Allen',
            Position: 'QB',
            Salary: 9000,
            FPPG: 25.0,
            Team: 'BUF',
            Opponent: 'NE',
            Injury_Indicator: '',
            Injury_Details: ''
        });
    });

    it('should handle missing optional injury details gracefully', () => {
        // Even if 'Injury Details' header is missing, if others are there, it might pass?
        // My code requires 'Id', 'First Name', 'Last Name', 'Position', 'Salary', 'FPPG', 'Team', 'Opponent', 'Injury Indicator'
        // 'Injury Details' is optional in my code?
        // Let's check the code: const injuryDetailsIdx = headers.indexOf('Injury Details');
        // It is NOT in requiredMap.

        const validCSV = `Id,First Name,Last Name,Position,Salary,FPPG,Team,Opponent,Injury Indicator
1,Josh,Allen,QB,9000,25.0,BUF,NE,,`;

        const result = parseCSVForImport(validCSV);
        expect(result).toHaveLength(1);
        expect(result[0].Injury_Details).toBeUndefined();
    });
});
