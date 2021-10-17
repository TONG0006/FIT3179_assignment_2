var visOpeningSequence = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A sun bar chart breakdown of opening move sequences by titled players from 1806-1873.",
    "width": 400,
    "height": 400,
    "padding": 5,
    "background": "#343a40",
    "autosize": "none",
    "signals": [
        {
            "name": "layer_select",
            "value": 4,
            "bind": {
                "name": "Moves: ",
                "input": "range",
                "min": 0,
                "max": 10,
                "step": 1
            }
        },
        {
            "name": "min_move_select",
            "value": 10,
            "bind": {
                "name": "Min moves",
                "input": "range",
                "min": 0,
                "max": 50,
                "step": 1
            }
        },
        {
            "name": "stroke_width",
            "value": 5,
            "bind": {
                "name": "Stroke width: ",
                "input": "range",
                "min": 0,
                "max": 10,
                "step": 1
            }
        }
    ],
    "data": [
        {
            "name": "tree",
            "url": "https://raw.githubusercontent.com/TONG0006/FIT3179_assignment_2/main/source/datasets/transformed/move_sequence.json",
            "transform": [
                {
                    "type": "stratify",
                    "key": "id",
                    "parentKey": "parent_id"
                },
                {
                    "type": "partition",
                    "field": "value",
                    "sort": {
                        "field": "value",
                        "order": "ascending"
                    },
                    "size": [
                        {
                            "signal": "2 * PI"
                        },
                        {
                            "signal": "width / (layer_select+1) * 5"
                        }
                    ],
                    "as": [
                        "a0",
                        "r0",
                        "a1",
                        "r1",
                        "depth",
                        "children"
                    ],
                    "signal": "partition_transform"
                },
                {
                    "type": "formula",
                    "as": "visible_partition",
                    "expr": "datum.depth <= layer_select & (datum.move_count > min_move_select)"
                }
            ]
        }
    ],
    "scales": [
        {
            "name": "color",
            "type": "linear",
            "domain": {
                "data": "tree",
                "field": "depth"
            },
            "range": {
                "scheme": "greys"
            }
        }
    ],
    "marks": [
        {
            "name": "moves",
            "type": "arc",
            "from": {
                "data": "tree"
            },
            "encode": {
                "enter": {
                    "x": {
                        "signal": "width / 2"
                    },
                    "y": {
                        "signal": "height / 2"
                    },
                    "fill": {
                        "scale": "color",
                        "field": "depth"
                    },
                    "tooltip": {
                        "signal": "'Move: ' + datum.move + (datum.move_count ? ', Occurences: ' + datum.move_count + ' move(s)' : '') + ', Move number: ' + datum.depth"
                    }
                },
                "update": {
                    "startAngle": {
                        "field": "a0"
                    },
                    "endAngle": {
                        "field": "a1"
                    },
                    "innerRadius": {
                        "field": "r0"
                    },
                    "outerRadius": {
                        "field": "r1"
                    },
                    "stroke": {
                        "value": "#343a40"
                    },
                    "fillOpacity": {
                        "field": "visible_partition"
                    },
                    "strokeWidth": {
                        "signal": "stroke_width"
                    },
                    "zindex": {
                        "value": 0
                    }
                },
                "hover": {
                    "stroke": {
                        "value": "red"
                    },
                    "strokeWidth": {
                        "value": 1
                    },
                    "zindex": {
                        "value": 1
                    }
                }
            }
        },
        {
            "type": "text",
            "from": {
                "data": "moves"
            },
            "encode": {
                "update": {
                    "x": {
                        "signal": "(datum.innerRadius+datum.outerRadius)/2 * cos((datum.startAngle+datum.endAngle)/2 - PI/2)"
                    },
                    "dx": {
                        "signal": "width/2 - 14"
                    },
                    "y": {
                        "signal": "(datum.innerRadius+datum.outerRadius)/2 * sin((datum.startAngle+datum.endAngle)/2 - PI/2)"
                    },
                    "dy": {
                        "signal": "height/2"
                    },
                    "baseline": [
                        {
                            "value": "bottom"
                        }
                    ],
                    "fillOpacity": {
                        "signal": "(datum.outerRadius < width/2) & ((datum.datum.move == 'initial setup') | (datum.datum.move == 'e4' & datum.datum.depth == 1 & datum.datum.move_count >= min_move_select) | (datum.datum.move == 'e5' & datum.datum.depth == 2 & datum.datum.move_count >= min_move_select) | (datum.datum.move == 'Nf3' & datum.datum.depth == 3 & datum.datum.move_count >= min_move_select) | (datum.datum.move == 'f4' & datum.datum.depth == 3 & datum.datum.move_count >= min_move_select) | (datum.datum.move == 'Nc6' & datum.datum.depth == 4 & datum.datum.move_count >= min_move_select))"
                    },
                    "fill": {
                        "value": "#ee0000"
                    },
                    "fontSize": {
                        "value": 16
                    },
                    "fontStyle": {
                        "value": "bold"
                    },
                    "text": {
                        "signal": "(datum.datum.move != 'f4' || datum.datum.move_count != 152) ? datum.datum.move : 'f4: Kings gambit'"
                    }
                }
            }
        }
    ]
};
var visGMMap = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "url": "https://raw.githubusercontent.com/TONG0006/FIT3179_assignment_2/main/source/datasets/transformed/gm_birthplace.csv"
    },
    "background": "#343a40",
    "vconcat": [
        {
            "width": 800,
            "height": 400,
            "projection": {
                "type": "equalEarth"
            },
            "data": {
                "url": "https://raw.githubusercontent.com/TONG0006/FIT3179_assignment_2/main/source/datasets/transformed/gm_birthplace.csv",
                "name": "data_birthplace"
            },
            "layer": [
                {
                    "data": {
                        "graticule": {
                            "step": [
                                15,
                                15
                            ]
                        }
                    },
                    "mark": {
                        "type": "geoshape",
                        "stroke": "lightgrey",
                        "strokeWidth": 1,
                        "strokeDash": [
                            5,
                            5
                        ],
                        "opacity": 1
                    }
                },
                {
                    "data": {
                        "url": "https://raw.githubusercontent.com/TONG0006/FIT3179_assignment_2/main/source/datasets/transformed/world_map_graticules.topojson",
                        "format": {
                            "type": "topojson",
                            "feature": "custom.geo"
                        }
                    },
                    "mark": {
                        "type": "geoshape",
                        "fill": "white",
                        "stroke": "darkgrey",
                        "strokeWidth": 0.9
                    }
                },
                {
                    "transform": [
                        {
                            "joinaggregate": [
                                {
                                    "op": "count",
                                    "as": "total_players",
                                    "field": "Title Year"
                                }
                            ]
                        },
                        {
                            "calculate": "(datum['Title Year'] < 2021)/datum.total_players * 1000000",
                            "as": "titled_player"
                        },
                        {
                            "filter": {
                                "param": "time_brush"
                            }
                        }
                    ],
                    "mark": {
                        "type": "circle",
                        "tooltip": {
                            "content": "data"
                        }
                    },
                    "encoding": {
                        "tooltip": [
                            {
                                "field": "Birthplace",
                                "title": "City",
                                "type": "nominal"
                            },
                            {
                                "field": "Longitude",
                                "title": "Longitude",
                                "type": "quantitative",
                                "format": ","
                            },
                            {
                                "field": "Latitude",
                                "title": "Latitude",
                                "type": "quantitative",
                                "format": ","
                            },
                            {
                                "field": "Population",
                                "title": "Population",
                                "type": "quantitative",
                                "format": ","
                            }
                        ],
                        "longitude": {
                            "field": "Longitude",
                            "title": "longitude",
                            "type": "quantitative"
                        },
                        "latitude": {
                            "field": "Latitude",
                            "type": "quantitative"
                        },
                        "opacity": {
                            "value": 0.45
                        },
                        "size": {
                            "field": "",
                            "title": "The number of GMs",
                            "aggregate": "count",
                            "scale": {
                                "domain": [
                                    1,
                                    2,
                                    3,
                                    5,
                                    10,
                                    30,
                                    40,
                                    50
                                ],
                                "type": "threshold",
                                "range": [
                                    10,
                                    20,
                                    30,
                                    100,
                                    200,
                                    300,
                                    400,
                                    500,
                                    1000
                                ]
                            },
                            "legend": {
                                "labelColor": "white",
                                "titleColor": "white",
                                "symbolFillColor": "white",
                                "orient": "bottom-left",
                                "direction": "horizontal"
                            }
                        },
                        "color": {
                            "field": "titled_player",
                            "title": [
                                "Weighted rate of titled",
                                "players per 1000000 players"
                            ],
                            "legend": {
                                "labelColor": "white",
                                "titleColor": "white",
                                "orient": "bottom-left",
                                "direction": "horizontal"
                            },
                            "aggregate": "average",
                            "scale": {
                                "domain": [
                                    0,
                                    0.1,
                                    0.5,
                                    1,
                                    10,
                                    50,
                                    100,
                                    100
                                ],
                                "type": "threshold",
                                "scheme": "yelloworangered"
                            }
                        }
                    }
                },
                {
                    "mark": {
                        "type": "text",
                        "align": "left"
                    },
                    "transform": [
                        {
                            "calculate": "datum.Longitude + 10",
                            "as": "dx"
                        },
                        {
                            "calculate": "datum.Latitude + 30",
                            "as": "dy"
                        }
                    ],
                    "encoding": {
                        "longitude": {
                            "field": "dx"
                        },
                        "latitude": {
                            "field": "dy"
                        },
                        "text": {
                            "field": "Birthplace",
                            "type": "nominal"
                        },
                        "color": {
                            "value": "black"
                        },
                        "opacity": {
                            "condition": {
                                "test": "datum.Birthplace == 'Moscow' | datum.Birthplace == 'Dresden' | datum.Birthplace == 'Reykjavík' | datum.Birthplace == 'Riga'",
                                "value": 1
                            },
                            "value": 0
                        }
                    }
                }
            ]
        },
        {
            "width": 800,
            "height": 100,
            "mark": "line",
            "params": [
                {
                    "name": "time_brush",
                    "select": {
                        "type": "interval",
                        "clear": "mouseup",
                        "encodings": [
                            "x"
                        ]
                    }
                }
            ],
            "encoding": {
                "x": {
                    "field": "Title Year",
                    "timeUnit": "year",
                    "axis": {
                        "title": "",
                        "format": "%Y",
                        "labelColor": "white",
                        "titleColor": "white",
                        "gridWidth": 0
                    }
                },
                "y": {
                    "aggregate": "count",
                    "axis": {
                        "title": "GMs by year",
                        "tickCount": 5,
                        "grid": false,
                        "labelColor": "white",
                        "titleColor": "white",
                        "gridWidth": 0
                    }
                },
                "color": {
                    "field": "Title",
                    "scale": {
                        "range": "diverging"
                    },
                    "legend": null
                }
            }
        },
        {
            "width": 800,
            "height": 100,
            "mark": "area",
            "encoding": {
                "x": {
                    "field": "Title Year",
                    "timeUnit": "year",
                    "scale": {
                        "domain": {
                            "param": "time_brush"
                        }
                    },
                    "axis": {
                        "title": "Year",
                        "tickCount": 10,
                        "grid": true,
                        "labelColor": "white",
                        "titleColor": "white",
                        "gridWidth": 1,
                        "gridDash": [
                            5,
                            5
                        ]
                    }
                },
                "y": {
                    "aggregate": "count",
                    "title": "GMs by year",
                    "axis": {
                        "labelColor": "white",
                        "titleColor": "white",
                        "gridWidth": 0
                    }
                },
                "color": {
                    "value": "white",
                    "legend": null
                }
            }
        }
    ]
};
var visFemaleTitle = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A breakdown of female vs males depending on the titles earnt.",
    "width": 300,
    "height": 300,
    "padding": 5,
    "background": "#343a40",
    "data": [
        {
            "name": "table",
            "url": "https://raw.githubusercontent.com/TONG0006/FIT3179_assignment_2/main/source/datasets/transformed/titled_females.json"
        }
    ],
    "scales": [
        {
            "name": "yscale",
            "type": "band",
            "domain": {
                "data": "table",
                "field": "title"
            },
            "range": "height",
            "padding": 0.2
        },
        {
            "name": "xscale",
            "type": "symlog",
            "domain": {
                "data": "table",
                "field": "value"
            },
            "range": "width",
            "round": true,
            "zero": true,
            "nice": true,
            "bins": [
                1,
                10,
                100,
                1000,
                9000,
                10000
            ]
        },
        {
            "name": "color",
            "type": "ordinal",
            "domain": {
                "data": "table",
                "field": "gender"
            },
            "range": {
                "scheme": [
                    "white",
                    "black"
                ]
            }
        }
    ],
    "axes": [
        {
            "orient": "left",
            "scale": "yscale",
            "tickSize": 1,
            "labelPadding": 10,
            "zindex": 1,
            "titleColor": "white",
            "tickColor": "white",
            "labelColor": "white"
        },
        {
            "orient": "bottom",
            "scale": "xscale",
            "labelColor": "white"
        }
    ],
    "marks": [
        {
            "type": "group",
            "from": {
                "facet": {
                    "data": "table",
                    "name": "facet",
                    "groupby": "title"
                }
            },
            "encode": {
                "enter": {
                    "y": {
                        "scale": "yscale",
                        "field": "title"
                    }
                }
            },
            "signals": [
                {
                    "name": "height",
                    "update": "bandwidth('yscale')"
                }
            ],
            "scales": [
                {
                    "name": "pos",
                    "type": "band",
                    "range": "height",
                    "domain": {
                        "data": "facet",
                        "field": "gender"
                    }
                }
            ],
            "marks": [
                {
                    "name": "bars",
                    "from": {
                        "data": "facet"
                    },
                    "tooltip": {
                        "content": "data"
                    },
                    "type": "rect",
                    "encode": {
                        "enter": {
                            "tooltip": {
                                "signal": "'Title: ' + datum.title + ', Count: ' + datum.value + ', Gender: ' + datum.gender"
                            },
                            "y": {
                                "scale": "pos",
                                "field": "gender"
                            },
                            "height": {
                                "scale": "pos",
                                "band": 1
                            },
                            "x": {
                                "scale": "xscale",
                                "field": "value"
                            },
                            "x2": {
                                "scale": "xscale",
                                "value": 0
                            },
                            "fill": {
                                "scale": "color",
                                "field": "gender"
                            },
                            "legend": {
                                "labelColor": "white",
                                "titleColor": "white",
                                "symbolFillColor": "white"
                            }
                        }
                    }
                },
                {
                    "type": "text",
                    "name": "bar_value",
                    "from": {
                        "data": "bars"
                    },
                    "encode": {
                        "enter": {
                            "x": {
                                "field": "x2",
                                "offset": -5
                            },
                            "y": {
                                "field": "y",
                                "offset": {
                                    "field": "height",
                                    "mult": 0.5
                                }
                            },
                            "fill": [
                                {
                                    "test": "contrast('white', datum.fill) > contrast('black', datum.fill)",
                                    "value": "white"
                                },
                                {
                                    "value": "black"
                                }
                            ],
                            "align": {
                                "value": "right"
                            },
                            "baseline": {
                                "value": "middle"
                            },
                            "text": {
                                "field": "datum.value"
                            }
                        }
                    }
                },
                {
                    "type": "text",
                    "from": {
                        "data": "bar_value"
                    },
                    "encode": {
                        "update": {
                            "x": {
                                "signal": "datum.x"
                            },
                            "dx": {
                                "signal": "-3"
                            },
                            "y": {
                                "signal": "datum.y"
                            },
                            "dy": {
                                "signal": "-10"
                            },
                            "fill": {
                                "value": "white"
                            },
                            "align": {
                                "value": "center"
                            },
                            "text": {
                                "signal": "(datum.datum.x2 > width * log(1600)/log(9000) & datum.datum.x2 < width * log(1879)/log(9000)-3) ? round(1690/37*100) + '% difference in GMs' : ''"
                            }
                        }
                    }
                }
            ]
        }
    ]
};
vegaEmbed('#vis_opening_sequence', visOpeningSequence);
vegaEmbed('#vis_gm_map', visGMMap);
vegaEmbed('#vis_female_title', visFemaleTitle);