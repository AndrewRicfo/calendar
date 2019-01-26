import React, { Component } from 'react';

export default class HistoryTableCell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inEditMode: false,
            value: this.props.value,
        };

        this.inputRef = React.createRef();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.value !== this.props.value || nextState.value !== this.state.value || nextState.inEditMode !== this.state.inEditMode;
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.state.inEditMode && !prevState.inEditMode) {
            this.inputRef.current.focus();
        }
    };

    changeInputValue = e => {
        this.setState({
            value: e.target.value.replace(/\D/g, ''),
        });
    };

    handleBlur = () => {
        const { updateCell, } = this.props;
        this.setState({
            inEditMode: false,
        });
        updateCell(this.state.value);
    };

    handleClickCell = () => {
        this.setState({
            inEditMode: true,
        });
    };

    render() {
        const { height, } = this.props;
        const style = {
            height,
        };

        return this.state.inEditMode ? (
            <input
                value={this.state.value}
                onChange={this.changeInputValue}
                onClick={e => e.target.focus()}
                onBlur={this.handleBlur}
                className="ht__day-cell"
                style={style}
                ref={this.inputRef}
            />
        ) : (
                <div
                    className="ht__day-cell"
                    onClick={this.handleBlur}
                    onDoubleClick={this.handleClickCell}
                    style={style}
                >
                    {this.state.value}
                </div>
            );
    }
}
