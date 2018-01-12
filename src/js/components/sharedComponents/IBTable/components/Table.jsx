import React from 'react';
import PropTypes from 'prop-types';
import { uniqueId, debounce } from 'lodash';

import HeaderRow from './HeaderRow';
import TableBody from './TableBody';

import RenderQueue from '../managers/RenderQueue';
import ScrollManager from '../managers/ScrollManager';

const propTypes = {
    bodyWidth: PropTypes.number,
    bodyHeight: PropTypes.number,
    headerHeight: PropTypes.number,
    contentWidth: PropTypes.number,
    rowCount: PropTypes.number,
    rowHeight: PropTypes.number,
    columns: PropTypes.array,
    onReachedBottom: PropTypes.func,
    headerCellRender: PropTypes.func,
    bodyCellRender: PropTypes.func
};

const defaultProps = {
    contentWidth: 0,
    bodyWidth: 0,
    bodyHeight: 0,
    headerHeight: 0,
    rowHeight: 0,
    rowCount: 0,
    columns: []
};


export default class Table extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollbarHeight: 0,
            tableId: String(uniqueId())
        };

        this._restorePointerTimer = null;

        this._headerComponent = null;
        this._bodyComponent = null;

        this._tableWrapper = null;
        this._internalDiv = null;

        this._scrolledTable = debounce(this._scrolledTable.bind(this));
        this._scrolledHeader = this._scrolledHeader.bind(this);
    }

    componentDidMount() {
        this._tableWrapper.addEventListener('scroll', this._scrolledTable, { passive: true });
    }

    reloadTable() {
        // force the scroll back to the top of the page
        this._tableWrapper.scrollLeft = 0;
        this._tableWrapper.scrollTop = 0;

        // wait for the scroll to complete before changing the row counts (to prevent false
        // pagination)
        window.setTimeout(() => {
            this._bodyComponent.reloadTable();
        }, 300);
    }

    scrollTo(x, y) {
        const scrollOperation = {
            operation: () => {
                if (!this._tableWrapper || !this._headerWrapper) {
                    return;
                }

                this._tableWrapper.scrollLeft = x;
                this._tableWrapper.scrollTop = y;
                this._headerWrapper.scrollLeft = 0;
            },
            type: 'overrideScroll',
            isSingle: true,
            args: []
        };

        RenderQueue.addWrite(scrollOperation);
    }

    _scrolledHeader() {
        // The header can only scroll through the use of accessibility hooks.
        // Because there are two scrolling elements (the transform offset + the scroll offset), we
        // need to combine them into a single scroll offset.
        const scrollOperation = {
            operation: () => {
                const realX = this._headerWrapper.scrollLeft + this._headerComponent.currentX;
                const x = realX;
                const y = this._tableWrapper.scrollTop;
                ScrollManager.update({
                    x,
                    y
                });

                // Scroll events in the table body will be applied as transforms while native
                // header scrolls via accessibility hooks, so we need to reset the header scrollLeft
                // to 0 and apply the full horizontal offset via transforms.
                // By calling the scrollTo function, we will apply the full horizontal offset to the
                // table body while simultaneously resetting the header scrollLeft to 0. The table
                // body's scrollLeft change will trigger the same scroll event that occurs from
                // native mouse scrolls in the table body (_scrolledTable). _scrolledTable will
                // synchronize the horizontal offset in the header entirely via transforms.
                this.scrollTo(x, y);
            },
            type: 'scroll',
            isSingle: true,
            args: []
        };

        RenderQueue.addRead(scrollOperation);
    }

    _scrolledTable() {
        const scrollOperation = {
            operation: () => {
                const x = this._tableWrapper.scrollLeft;
                const y = this._tableWrapper.scrollTop;
                ScrollManager.update({
                    x,
                    y
                });
            },
            type: 'scroll',
            isSingle: true,
            args: []
        };

        const pointerOperation = {
            operation: () => {
                if (this._restorePointerTimer) {
                    window.clearTimeout(this.restorePointer);
                    this._restorePointerTimer = null;
                }
                this._internalDiv.style.pointerEvents = 'none';
                this._restorePointerTimer = window.setTimeout(() => {
                    this._internalDiv.style.pointerEvents = 'auto';
                }, 150);
            },
            type: 'pointer',
            isSingle: true,
            args: []
        };

        RenderQueue.addRead(scrollOperation);
        RenderQueue.addWrite(pointerOperation);
    }

    _measureHorizontalScrollbar() {
        let scrollbarHeight = 0;
        // measure how much vertical space is inside the container
        const containerInternalHeight = this._tableWrapper.clientHeight;
        // measure how much vertical space the container takes up on the page
        const containerExternalHeight = this._tableWrapper.offsetHeight;

        if (containerInternalHeight < containerExternalHeight) {
            // the internal height is less than the external height, this means that some of the
            // internal height height is being blocked by a horizontal scrollbar (which takes up
            // vertical space)
            scrollbarHeight = containerExternalHeight - containerInternalHeight;
        }

        return scrollbarHeight;
    }

    render() {
        const visibleWidth = Math.min(this.props.bodyWidth, this.props.contentWidth);
        const visibleHeight = Math.min(this.props.bodyHeight,
            this.props.rowCount * this.props.rowHeight);

        const style = {
            minWidth: visibleWidth,
            maxWidth: visibleWidth,
            maxHeight: visibleHeight + this.props.headerHeight + this.state.scrollbarHeight,
            minHeight: visibleHeight + this.props.headerHeight + this.state.scrollbarHeight
        };

        const headerStyle = {
            minWidth: visibleWidth,
            maxWidth: visibleWidth,
            maxHeight: this.props.headerHeight,
            minHeight: this.props.headerHeight
        };

        const bodyStyle = {
            minWidth: visibleWidth,
            maxWidth: visibleWidth,
            maxHeight: visibleHeight + this.state.scrollbarHeight,
            minHeight: visibleHeight + this.state.scrollbarHeight
        };

        const contentStyle = {
            width: this.props.contentWidth,
            height: (this.props.rowCount * this.props.rowHeight)
        };

        return (
            <div
                className="ibt-table-container"
                style={style}
                role="grid">
                <div
                    className="ibt-table-header-container"
                    style={headerStyle}
                    onScroll={this._scrolledHeader}
                    role="presentation"
                    ref={(div) => {
                        this._headerWrapper = div;
                    }}>
                    <HeaderRow
                        contentWidth={this.props.contentWidth}
                        headerHeight={this.props.headerHeight}
                        columns={this.props.columns}
                        headerCellRender={this.props.headerCellRender}
                        tableId={this.state.tableId}
                        ref={(component) => {
                            this._headerComponent = component;
                        }} />
                </div>
                <div
                    className="ibt-table-body-section"
                    style={bodyStyle}
                    role="presentation"
                    ref={(div) => {
                        this._tableWrapper = div;
                    }}>
                    <div
                        className="ibt-table-content"
                        role="presentation"
                        style={contentStyle}
                        ref={(div) => {
                            this._internalDiv = div;
                        }}>
                        <TableBody
                            columns={this.props.columns}
                            contentWidth={this.props.contentWidth}
                            bodyWidth={visibleWidth}
                            bodyHeight={visibleHeight}
                            rowHeight={this.props.rowHeight}
                            rowCount={this.props.rowCount}
                            bodyCellRender={this.props.bodyCellRender}
                            onReachedBottom={this.props.onReachedBottom}
                            tableId={this.state.tableId}
                            ref={(component) => {
                                this._bodyComponent = component;
                            }} />
                    </div>
                </div>
            </div>
        );
    }
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;
