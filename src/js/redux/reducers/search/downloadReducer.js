/**
 * downloadReducer.js
 * Created by Kevin Li 8/8/17
 */

import { List } from 'immutable';

export const initialState = {
    type: 'award',
    columns: new List(),
    expectedFile: ''
};

const downloadReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_DOWNLOAD_TYPE': {
            return Object.assign({}, state, {
                type: action.downloadType
            });
        }
        case 'SET_DOWNLOAD_COLUMNS': {
            return Object.assign({}, state, {
                columns: new List(action.columns)
            });
        }
        case 'SET_DOWNLOAD_EXPECTED_FILE': {
            return Object.assign({}, state, {
                expectedFile: action.file
            });
        }
        case 'RESET_DOWNLOAD': {
            return Object.assign({}, initialState);
        }
        default:
            return state;
    }
};

export default downloadReducer;
