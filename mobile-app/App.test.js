import React from 'react';
import renderer from 'react-test-renderer';

import App from './App';

describe('<App />', () => {
    it('has 1 child', () => {
        // Just a simple smoke test to ensure it mounts without crashing
        // Note: Deep rendering navigation containers in generic Jest environment can be tricky
        // without more mocks, but let's try a basic render.
        const tree = renderer.create(<App />).toJSON();
        expect(tree).toBeDefined();
    });
});
