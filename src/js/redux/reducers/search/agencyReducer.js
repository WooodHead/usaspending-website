/**
 * Created by michaelbray on 12/12/16.
 */

import _ from 'lodash';

const initialState = [];

const agencyReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_AUTOCOMPLETE_AWARDING_AGENCIES': {
            return _.concat([], action.awardingAgencies);
        }
        case 'SET_AUTOCOMPLETE_FUNDING_AGENCIES': {
            return _.concat([], action.fundingAgencies);
        }
        default:
            return state;
    }
};

export default agencyReducer;
