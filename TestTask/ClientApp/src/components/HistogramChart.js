﻿import React, { Component } from 'react'
import { Chart } from 'react-google-charts'



export class HistogramChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            histogramData: this.props.data
        };
    }
    render() {
        var chartOptions = {
            title: 'Распределение длительностей жизней пользователей',
            legend: { position: 'bottom'},
            colors: ['#32BFEB'],
            interpolateNulls: false,
            trendlines: {
                0: {
                    type: 'exponential',
                    showR2: true,
                    visibleInLegend: false
                }
            },
            hAxis: { title: 'Life Time' },
            vAxis: {
                title: 'Users count',
                scaleType: this.props.AxisType,
                ticks: [0, 1, 2, 3, 4, 5]
            }
        }
        return (
            <div className="container mt-1">
                <Chart
                    chartType="Histogram"
                    loader={<div>Loading Chart</div>}
                    data={this.props.data}
                    options={chartOptions}
                    rootProps={{ 'data-testid': '5' }}
                />
            </div>
        )
    }
}

