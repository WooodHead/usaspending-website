/**
  * ResultsTableTabItem.jsx
  * Created by Kevin Li 11/29/16
  **/

import React from 'react';
import PropTypes from 'prop-types';

import { formatNumber } from 'helpers/moneyFormatter';

const propTypes = {
    label: PropTypes.string,
    internal: PropTypes.string,
    count: PropTypes.number,
    active: PropTypes.bool,
    enabled: PropTypes.bool,
    switchTab: PropTypes.func
};

export default class ResultsTableTabItem extends React.Component {
    constructor(props) {
        super(props);

        this.clickedTab = this.clickedTab.bind(this);
    }

    clickedTab() {
        this.props.switchTab(this.props.internal);
    }

    render() {
        let activeClass = '';
        let disabledStatus = '';
        if (this.props.active) {
            activeClass = ' active';
        }
        if (this.props.enabled === false) {
            disabledStatus = true;
        }
        else {
            disabledStatus = false;
        }

        let resultString = 'results';
        if (this.props.count === 1) {
            resultString = 'result';
        }

        return (
            <button
                className={`table-type-toggle${activeClass}`}
                onClick={this.clickedTab}
                role="menuitemradio"
                aria-checked={this.props.active}
                title={`Show ${this.props.label}`}
                aria-label={`Show ${this.props.label} - ${this.props.count} ${resultString}`}
                disabled={disabledStatus}>
                <div className="tab-content">
                    <div className="tab-label">
                        {this.props.label}
                    </div>
                    <div className={`count-badge ${activeClass}`}>
                        {formatNumber(this.props.count)}
                    </div>
                </div>
            </button>
        );
    }
}

ResultsTableTabItem.propTypes = propTypes;
