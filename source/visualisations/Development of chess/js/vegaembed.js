var visOpeningSequence = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A sun bar chart breakdown of opening move sequences by titled players from 1806-1873.",
    "width": 400,
    "height": 400,
    "padding": 5,
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
        }
    ]
};
var visGMMap = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 800,
    "height": 500,
    "background": "#343a40",
    "params": [
        {
            "name": "year_select",
            "value": 2010,
            "bind": {
                "input": "range",
                "min": 1908,
                "max": 2021,
                "step": 1,
                "name": "Min year of birth: "
            }
        }
    ],
    "projection": {
        "type": "equalEarth"
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
                "url": "https://raw.githubusercontent.com/TONG0006/FIT3179_assignment_2/GM_birthplace/source/datasets/transformed/world_map_graticules.topojson",
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
            "data": {
                "url": "https://raw.githubusercontent.com/TONG0006/FIT3179_assignment_2/GM_birthplace/source/datasets/transformed/gm_birthplace.csv"
            },
            "transform": [
                {
                    "calculate": "isValid(datum.Born)",
                    "as": "player_count"
                },
                {
                    "calculate": "(datum['Title Year'] < year_select)/datum.Population * 1000000",
                    "as": "titled_player"
                },
                {
                    "filter": "(datum.Born <= year_select) & (isValid(datum.Dead) ? (datum.Dead >= year_select) : true)"
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
                    },
                    {
                        "field": "titled_player",
                        "title": "Rate of GMs per 1,000,000",
                        "type": "quantitative"
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
                    "field": "player_count",
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
                        "symbolFillColor": "white"
                    }
                },
                "color": {
                    "field": "titled_player",
                    "title": [
                        "Rate of players who have a ",
                        "title per 1,000,000 weighted",
                        "against their population"
                    ],
                    "legend": {
                        "labelColor": "white",
                        "titleColor": "white"
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
                "align": "right",
                "baseline": "middle",
                "dx": -12,
                "fontStyle": "italic"
            },
            "encoding": {
                "text": {
                    "field": "Birthplace",
                    "type": "nominal"
                },
                "color": {
                    "value": "white"
                },
                "opacity": {
                    "condition": {
                        "test": "datum.Birthplace == 'Moscow'",
                        "value": 1
                    },
                    "value": 1
                }
            }
        }
    ]
};
var visFemaleTitle = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A breakdown of female vs males depending on the titles earnt.",
    "title": "A breakdown of female vs males depending on the titles earnt.",
    "width": 300,
    "height": 340,
    "padding": 5,
    "background": "white",
    "data": [
        {
            "name": "table",
            "values": [
                {
                    "title": "CM",
                    "gender": "Female",
                    "value": 19
                },
                {
                    "title": "CM",
                    "gender": "Male",
                    "value": 1879
                },
                {
                    "title": "DI",
                    "gender": "Female",
                    "value": 3
                },
                {
                    "title": "DI",
                    "gender": "Male",
                    "value": 14
                },
                {
                    "title": "FI",
                    "gender": "Female",
                    "value": 1
                },
                {
                    "title": "FI",
                    "gender": "Male",
                    "value": 4
                },
                {
                    "title": "FM",
                    "gender": "Female",
                    "value": 39
                },
                {
                    "title": "FM",
                    "gender": "Male",
                    "value": 8206
                },
                {
                    "title": "GM",
                    "gender": "Female",
                    "value": 37
                },
                {
                    "title": "GM",
                    "gender": "Male",
                    "value": 1690
                },
                {
                    "title": "IM",
                    "gender": "Female",
                    "value": 121
                },
                {
                    "title": "IM",
                    "gender": "Male",
                    "value": 3766
                },
                {
                    "title": "NI",
                    "gender": "Female",
                    "value": 2
                },
                {
                    "title": "NI",
                    "gender": "Male",
                    "value": 22
                },
                {
                    "title": "WCM",
                    "gender": "Female",
                    "value": 779
                },
                {
                    "title": "WCM",
                    "gender": "Male",
                    "value": 2
                },
                {
                    "title": "WFM",
                    "gender": "Female",
                    "value": 1758
                },
                {
                    "title": "WGM",
                    "gender": "Female",
                    "value": 318
                },
                {
                    "title": "WH",
                    "gender": "Female",
                    "value": 1
                },
                {
                    "title": "WIM",
                    "gender": "Female",
                    "value": 837
                }
            ]
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
            "tickSize": 10,
            "labelPadding": 10,
            "zindex": 1
        },
        {
            "orient": "bottom",
            "scale": "xscale"
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
                            }
                        }
                    }
                },
                {
                    "type": "text",
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
                }
            ]
        }
    ]
};
vegaEmbed('#vis_opening_sequence', visOpeningSequence);
vegaEmbed('#vis_gm_map', visGMMap);
vegaEmbed('#vis_female_title', visFemaleTitle);