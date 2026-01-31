
import { isValidComposition } from './RosterContext';

describe('RosterContext Logic', () => {
    test('1 QB - Valid', () => {
        const roster = [{ pos: 'QB' }];
        expect(isValidComposition(roster)).toBe(true);
    });

    test('2 QBs - Invalid', () => {
        const roster = [{ pos: 'QB' }, { pos: 'QB' }];
        expect(isValidComposition(roster)).toBe(false);
    });

    test('2 RBs - Valid', () => {
        const roster = [{ pos: 'RB' }, { pos: 'RB' }];
        expect(isValidComposition(roster)).toBe(true);
    });

    test('3 RBs (Flex) - Valid', () => {
        const roster = [{ pos: 'RB' }, { pos: 'RB' }, { pos: 'RB' }];
        expect(isValidComposition(roster)).toBe(true);
    });

    test('4 RBs - Invalid', () => {
        const roster = [{ pos: 'RB' }, { pos: 'RB' }, { pos: 'RB' }, { pos: 'RB' }];
        expect(isValidComposition(roster)).toBe(false);
    });

    test('Full Composition mixed - Valid', () => {
        const roster = [
            { pos: 'QB' },
            { pos: 'RB' }, { pos: 'RB' },
            { pos: 'WR' }, { pos: 'WR' },
            { pos: 'TE' },
            { pos: 'RB' }, // Flex
            { pos: 'D' }
        ];
        expect(isValidComposition(roster)).toBe(true);
    });

    // Test Explicit Flex property if passed (simulating backend/context state)
    test('Explicit Flex - Valid', () => {
        const roster = [
            { pos: 'RB' }, { pos: 'RB' },
            { pos: 'RB', isFlex: true }
        ];
        expect(isValidComposition(roster)).toBe(true);
    });

    test('Explicit Flex - Invalid Pos', () => {
        const roster = [
            { pos: 'QB', isFlex: true } // QB cannot be flex
        ];
        expect(isValidComposition(roster)).toBe(false);
    });
});
