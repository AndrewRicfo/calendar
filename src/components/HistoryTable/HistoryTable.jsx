import React, { Component } from "react";
import HistoryTableCell from '../HistoryTableCell/HistoryTableCell.jsx';
import "./HistoryTable.scss";
import moment from "moment";

const SET_TYPES = {
    DATA: 0,
    CALENDAR: 1,
};

export default class HistoryTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dragging: false,
            startDate: '',
            endDate: '',
            touchedMonths: [],
            rowsArray: [],
        };

        this.lastClientX = null;
        this.headerTopRef = React.createRef();
        this.headerBotRef = React.createRef();
        this.containerRef = React.createRef();
        this.months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
    }

    shouldComponentUpdate = (nextProps, nextState, ) => {
        // prevent updating on drag event
        return nextState.dragging === this.state.dragging;
    };

    componentDidMount = () => {
        const scrollableContainer = document.querySelector('.ht__cell-wrap');
        const startDate = moment(new Date(this.props.dateStart).valueOf());
        const endDate = moment(new Date(this.props.dateEnd).valueOf());
        const startDateCopy = startDate.clone();
        const touchedMonths = [];

        while (endDate > startDateCopy || startDateCopy.format('MM') === endDate.format('MM')) {
            touchedMonths.push(startDateCopy.format('YYYY-MM'));
            startDateCopy.add(1, 'month');
        }

        this.setState({
            startDate,
            endDate,
            touchedMonths,
        });

        const rowsArray = this.getRowsHeight();

        this.setState({
            rowsArray,
        });

        scrollableContainer.addEventListener('mousedown', this.mouseDownHandler);
        window.addEventListener('mouseup', this.mouseUpHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
    };

    getRowsHeight = () => {
        const rows = document.querySelectorAll('.ht__row--static');
        let rowsArray = [];
        Array.from(rows)
            .forEach((row, idx) => {
                const { height } = row.getBoundingClientRect();
                rowsArray.push({
                    idx,
                    height,
                });
            });
        return rowsArray;
    };

    componentWillUnmount = () => {
        const scrollableContainer = document.querySelector('.ht__cell-wrap');
        scrollableContainer.removeEventListener('mousedown', this.mouseDownHandler);
        window.removeEventListener('mouseup', this.mouseUpHandler);
        window.removeEventListener('mousemove', this.mouseMoveHandler);
    };

    mouseUpHandler = () => {
        if (this.state.dragging) {
            this.setState({
                dragging: false,
            });
        }
    };

    mouseDownHandler = e => {
        if (!this.state.dragging) {
            this.setState({
                dragging: true,
            });
            this.lastClientX = e.clientX;
            this.lastClientY = e.clientY;
            // e.preventDefault();
            // document.activeElement.blur();
        }
        return true;
    };

    mouseMoveHandler = (e) => {
        if (this.state.dragging) {
            const oldClientX = this.lastClientX;
            this.headerTopRef.current.scrollLeft -= 1 * (-oldClientX + (this.lastClientX = e.clientX));
            this.headerBotRef.current.scrollLeft -= -oldClientX + (this.lastClientX = e.clientX);
            this.containerRef.current.scrollLeft -= -oldClientX + (this.lastClientX = e.clientX);
        }
    };

    getDaysForEachMonth = () => {
        const daysForEachMonth = Array(this.state.touchedMonths.length).fill(0);
        let prevValues = 0;

        this.state.touchedMonths.map((date, idx) => {
            const endOfCurrMonth = moment().year(+date.split('-')[0]).month(+date.split('-')[1]).date(0);
            const startOfCurrMonth = moment().year(+date.split('-')[0]).month(+date.split('-')[1]).subtract(1, 'months').date(1);

            // for last one
            if (idx > 0 && idx === this.state.touchedMonths.length - 1) {
                daysForEachMonth[idx] = Math.ceil(moment.duration(this.state.endDate.diff(startOfCurrMonth)).asDays()) + 1;
            }
            // for only one
            else if (idx === 0 && idx === this.state.touchedMonths.length - 1) {
                daysForEachMonth[idx] = Math.ceil(moment.duration(this.state.endDate.diff(this.state.startDate)).asDays()) + 1;
            }
            // for first one
            else if (idx === 0 && this.state.touchedMonths.length >= 1) {
                daysForEachMonth[idx] = Math.ceil(moment.duration(endOfCurrMonth.diff(this.state.startDate)).asDays());
                prevValues += Math.floor(moment.duration(endOfCurrMonth.diff(this.state.startDate)).asDays()) - prevValues;
            }
            // for 'center'(full) month
            else if (idx > 0 && idx !== this.state.touchedMonths.length - 1) {
                daysForEachMonth[idx] = Math.floor(moment.duration(endOfCurrMonth.diff(this.state.startDate)).asDays() - prevValues);
                prevValues += Math.floor(moment.duration(endOfCurrMonth.diff(this.state.startDate)).asDays()) - prevValues;
            }
        });

        return daysForEachMonth;
    };

    renderCalendarMonth = () => {
        const daysForEachMonth = this.getDaysForEachMonth();
        let prevWidths = 0;

        return (
            <div className="ht__calendar-header-inner-wrap">
                {this.state.touchedMonths.map((date, idx) => {
                    prevWidths = idx > 0 ? prevWidths + daysForEachMonth[idx - 1] : 0;
                    return (
                        <div
                            key={idx}
                            title={`${this.months[+date.split('-')[1] - 1]} ${date.split('-')[0]}`}
                            className="ht__calendar-header-top-inner"
                            style={{
                                width: daysForEachMonth[idx] * 30,
                                left: prevWidths * 30,
                            }}
                        >
                            {this.months[+date.split('-')[1] - 1]}&nbsp;{date.split('-')[0]}
                        </div>
                    )
                })}
            </div>
        );
    };

    renderCalendarDays = () => {
        const daysForEachMonth = this.getDaysForEachMonth();
        const sumOfDays = daysForEachMonth.reduce((acc, curr) => acc + curr, 0);
        const months = Array(sumOfDays).fill(0);
        const startDate = this.state.startDate && this.state.startDate.clone();
        let startDay = startDate && startDate.subtract(1, 'days');

        return (
            <div className="ht__calendar-header-inner-wrap">
                {months.map((day, idx) => {
                    startDay = startDay.add(1, 'days');

                    return (
                        <div key={idx} className="ht__calendar-header-day">
                            {startDay.date()}
                        </div>
                    );
                })}
            </div>
        );
    };

    handleUpdateCell = (date, idx) => (newVal) => {
        this.props.updateCell(date, idx, +newVal);
    };

    renderCalendarCells = cols => {
        const daysForEachMonth = this.getDaysForEachMonth();
        const sumOfDays = daysForEachMonth.reduce((acc, curr) => acc + curr, 0);
        const allDays = Array(sumOfDays).fill(0);

        //hardcoded, watching for first set, first column
        const allRows = Array(this.props.sets[0].columns[0].values.length).fill(0);

        const startDate = this.state.startDate && this.state.startDate.clone();
        let startDay = startDate && startDate.subtract(1, 'days');

        return allDays.map((day, idx) => {
            startDay.add(1, 'days');
            const dayInData = cols.find(col =>
                moment(new Date(col.date).valueOf()).format('MM-DD') === startDay.format('MM-DD')
            );

            return (
                <div key={idx} className="ht__day">
                    {allRows.map((row, _idx) => {
                        return (
                            <HistoryTableCell
                                rowsArray={this.state.rowsArray}
                                height={this.state.rowsArray[_idx].height}
                                key={`${startDay.format('MM-DD')}${_idx}`}
                                value={dayInData ? dayInData.values[_idx] : ''}
                                updateCell={this.handleUpdateCell(startDay.format('MM/DD/YYYY'), _idx)}
                            />
                        );
                    })}
                </div>
            )
        });
    };

    render() {
        const { sets, } = this.props;
        return (
            <div className="divTable">
                <div className="divTableBody">
                    <div className="divTableRow d-flex">
                        {sets.map((set, setIdx) => {
                            const classList = new Set([
                                'ht__row',
                                setIdx === 0 ? 'ht__row--static' : '',
                            ]);

                            return set.type === SET_TYPES.DATA
                                ? (
                                    <div
                                        key={setIdx}
                                        className={`divTableCell${set.editable ? ' editable' : ''}`}
                                        style={{ width: set.width }}
                                    >
                                        {set.columns.map((col, colIdx) => (
                                            <div key={colIdx} className="divTableCell">
                                                <div className="divInnerTableHeader">{col.title}</div>
                                                {col.values.map((val, valIdx) => (
                                                    <div
                                                        key={valIdx}
                                                        className={Array.from(classList).join(' ')}
                                                        style={{
                                                            maxWidth: set.width,
                                                            height: this.state.rowsArray[valIdx] ? this.state.rowsArray[valIdx].height : 'auto',
                                                        }}
                                                    >
                                                        {val}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )
                                : set.type === SET_TYPES.CALENDAR && (
                                    <div key={setIdx} className="divTableCell" style={{ width: set.width }}>
                                        <div className="ht__calendar-header">
                                            <div className="ht__calendar-header-top" ref={this.headerTopRef}>
                                                {this.renderCalendarMonth()}
                                            </div>
                                            <div className="ht__calendar-header-bot" ref={this.headerBotRef}>
                                                {this.renderCalendarDays()}
                                            </div>
                                        </div>
                                        <div className='divTableCell ht__cell-wrap' ref={this.containerRef}>
                                            {this.renderCalendarCells(set.columns)}
                                        </div>
                                    </div>
                                )
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
