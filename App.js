Ext.define('Rally.example.CFDCalculator', {
    extend: 'Rally.data.lookback.calculator.TimeSeriesCalculator',
    config: {
        stateFieldName: 'ScheduleState',
        stateFieldValues: ['Defined', 'In-Progress', 'Completed', 'Accepted']
    },
    constructor: function(config) {
        this.initConfig(config);
        this.callParent(arguments);
    },

    getMetrics: function() {
        return _.map(this.getStateFieldValues(), function(stateFieldValue) {
            return  {
                as: stateFieldValue,
                groupByField: this.getStateFieldName(),
                allowedValues: [stateFieldValue],
                f: 'groupByCount',
                display: 'area'
            };
        }, this);
    }
});

Ext.define('Rally.example.CFDChart', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'release',
    comboboxConfig: {
        fieldLabel: 'Select a Release:',
        labelWidth: 100,
        width: 300
    },

    requires: [
        'Rally.example.CFDCalculator'
    ],

    onScopeChange: function() {
        if (this.down('#mychart')) {
	    this.down('#mychart').destroy();
	}
        this.add({
            xtype: 'rallychart',
            itemId: 'mychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            storeConfig: this._getStoreConfig(),
            calculatorType: 'Rally.example.CFDCalculator',
            calculatorConfig: {
                stateFieldName: 'ScheduleState',
                stateFieldValues: ['Defined', 'In-Progress', 'Completed', 'Accepted']
            },
            chartConfig: this._getChartConfig()
        });
    },

    _getStoreConfig: function() {
        var release = this.getContext().getTimeboxScope().record.data.ObjectID;
        console.log('rel', release);
        return {
            find: {
                _TypeHierarchy: { '$in' : [ 'HierarchicalRequirement', 'Defect' ] },
                Release: release, 
                Children: null,
                _ProjectHierarchy: this.getContext().getProject().ObjectID
            },
            fetch: ['ScheduleState'],
            hydrate: ['ScheduleState'],
            sort: {
                _ValidFrom: 1
            },
            context: this.getContext().getDataContext(),
            limit: Infinity
        };
    },

    _getChartConfig: function() {
        return {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Project Cumulative Flow'
            },
            xAxis: {
                tickmarkPlacement: 'on',
                tickInterval: 20,
                title: {
                    text: 'Date'
                }
            },
            yAxis:
                {
                    title: {
                        text: 'Count'
                    }
                },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                },
                area: {
                    stacking: 'normal'
                }
            }
        };
    }
});