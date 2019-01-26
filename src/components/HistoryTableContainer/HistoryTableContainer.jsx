import React, { Component } from "react";
import HistoryTable from "../HistoryTable/HistoryTable.jsx";

const SET_TYPES = {
    DATA: 0,
    CALENDAR: 1,
};

export default class HistortyTableContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            //Table data
            historyTableData: [
                {
                    type: SET_TYPES.DATA,
                    width: 200,
                    editable: false,
                    columns: [
                        {
                            title: 'Date',
                            values: [
                                'Total Pickup',
                                'Contracted Block',
                                'Commissionable Rooms Inside the Block',
                                'Commissionable Rooms Outside the Block',
                                'Earned Comps',
                                'Non-Commissionable Room',
                                'Contracted Delta',
                                'Total Commissionable Pickup'
                            ]
                        }
                    ]
                },
                {
                    type: SET_TYPES.CALENDAR,
                    width: 450,
                    editable: true,
                    columns: [
                        { date: '10/31/2018', values: [3, 0, 0, 0, 0, 0, 0, 0] },
                        { date: '11/01/2018', values: [0, 4, 0, 0, 0, 0, 0, 0] },
                        { date: '11/02/2018', values: [0, 0, 5, 0, 0, 0, 0, 0] },
                        { date: '11/03/2018', values: [0, 0, 0, 6, 0, 0, 0, 0] },
                        { date: '11/04/2018', values: [0, 0, 0, 0, 7, 0, 0, 0] },
                        { date: '11/05/2018', values: [0, 0, 0, 0, 0, 8, 0, 0] },
                        { date: '11/06/2018', values: [0, 0, 0, 0, 0, 0, 9, 0] },
                        { date: '11/07/2018', values: [0, 0, 0, 0, 0, 0, 0, 10] },
                        { date: '11/08/2018', values: [1, 0, 0, 0, 0, 0, 0, 0] },
                        { date: '11/09/2018', values: [0, 2, 0, 0, 0, 0, 0, 0] },
                        { date: '11/11/2018', values: [0, 0, 3, 0, 0, 0, 0, 0] },
                        { date: '11/12/2018', values: [0, 0, 0, 4, 0, 0, 0, 0] },
                        { date: '11/13/2018', values: [0, 0, 0, 0, 5, 0, 0, 0] },
                        { date: '11/14/2018', values: [0, 0, 0, 0, 0, 6, 0, 0] },
                        { date: '11/15/2018', values: [0, 0, 0, 0, 0, 0, 7, 0] },
                        { date: '11/17/2018', values: [0, 0, 0, 0, 0, 0, 0, 8] }
                    ]
                },
                {
                    type: SET_TYPES.DATA,
                    width: 200,
                    editable: false,
                    columns: [
                        {
                            id: 'avgRate',
                            title: 'Avg. Rate',
                            values: [0, 0, 0, 0, 0, 0, 0, 0]
                        },
                        {
                            id: 'totalRoomNights',
                            title: 'Total Room Nights',
                            values: [0, 0, 0, 0, 0, 0, 0, 0]
                        }
                    ]
                },
                {
                    type: SET_TYPES.DATA,
                    width: 290,
                    editable: true,
                    columns: [
                        {
                            title: 'Commissionable Revenue',
                            values: [0, 0, 0, 0, 0, 0, 0, 0]
                        },
                        {
                            title: '%',
                            values: [0, 0, 0, 0, 0, 0, 0, 0]
                        },
                        {
                            title: 'Commission',
                            values: [0, 0, 0, 0, 0, 0, 0, 0]
                        }
                    ]
                },
            ],
        };
    }

    componentDidMount = () => {
        const totalRoomsPerRow = this.calculateTotalRoomNights(this.state.historyTableData);
        const avgRate = this.calculateAvgRate(this.state.historyTableData);
        const newState = JSON.parse(JSON.stringify(this.state));
        newState.historyTableData[2].columns.find(col => col.id === 'totalRoomNights').values = totalRoomsPerRow;
        newState.historyTableData[2].columns.find(col => col.id === 'avgRate').values = avgRate;
        this.setState(newState);
    };


    calculateAvgRate = (historyTableData) => {
        const calendarObj = historyTableData.find(colset => colset.type === SET_TYPES.CALENDAR);
        const initialArray = new Array(historyTableData[0].columns[0].values.length).fill(0);

        calendarObj.columns.forEach(col => {
            col.values.forEach((value, idx) => initialArray[idx] += value);
        });

        return initialArray.map(val => parseFloat(val / calendarObj.columns.length).toFixed(2));
    };


    calculateTotalRoomNights = (historyTableData) => {
        const calendarObj = historyTableData.find(colset => colset.type === SET_TYPES.CALENDAR);
        const initialArray = new Array(historyTableData[0].columns[0].values.length).fill(0);

        calendarObj.columns.forEach(col => {
            col.values.forEach((value, idx) => initialArray[idx] += value);
        });

        return initialArray;
    };

    updateCell = (columnKey, index, newCellValue) => {
        const { historyTableData } = this.state;

        const updatedData = JSON.parse(JSON.stringify(historyTableData));
        const calSet = updatedData.find(({ type }) => type === SET_TYPES.CALENDAR);
        const curDate = calSet.columns.find((col) => col.date === columnKey);
        if (curDate) {
            curDate.values[index] = newCellValue
        } else {
            const values = [0, 0, 0, 0, 0, 0, 0, 0];
            values[index] = newCellValue;
            calSet.columns.push({ date: columnKey, values });
        }

        // update totals
        const totalRoomsPerRow = this.calculateTotalRoomNights(updatedData);
        const avgRate = this.calculateAvgRate(updatedData);
        updatedData[2].columns.find(col => col.id === 'totalRoomNights').values = totalRoomsPerRow;
        updatedData[2].columns.find(col => col.id === 'avgRate').values = avgRate;

        this.setState({
            historyTableData: updatedData,
        });
    };

    render() {
        return (
            <HistoryTable
                dateStart="09/30/2018"
                dateEnd="11/18/2018"
                sets={this.state.historyTableData}
                updateCell={this.updateCell}
            />
        );
    }
}

