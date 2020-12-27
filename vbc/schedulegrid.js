            function navigate($url) {
                window.location.href = $url;
            }

            function getEventId($row) {
                var $title = r2f($row, 'title');
                var $date = new Date(Date.parse(r2f($row, 'date')));
                return $title.replace(/\s+/g, '').replace(/[^a-z0-9]/ig, '').toLowerCase() + $date.getDate();
            }

            function r2f($row, $field) {
                return $row["gsx$" + $field].$t;
            }

            function parseDate($eventDate, $eventTime) {
                
                if( $eventDate == '' )
                    $eventDate = 'Fri Jan 1 2100';
                if( $eventTime == '' )
                    $eventTime = '12:00 AM';
                
                var $retval = new Date(Date.parse($eventDate + ' ' + $eventTime));
                return $retval;
            }

            function randInt($num) {
                return Math.floor(Math.random() * $num);
            }

            function dateToWeekday($date) {
                const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var month = $date.getMonth() + 1;
                return weekdays[$date.getDay()] + ' ' + month + '/' + $date.getDate();
            }

            function makeEvent($row) {

                var datetime_start = parseDate(r2f($row, 'date'), r2f($row, 'timestart'));
                var datetime_stop = parseDate(r2f($row, 'date'), r2f($row, 'timestop'));
                var timestart = r2f($row, 'timestart');
                var timestop = r2f($row, 'timestop');
                
                var hours = 'Time TBD';
                if( timestart != '' )
                    hours = timestart;
                if( timestop != '' )
                    hours += ' to ' + timestop;
                    
                return {
                    datetime_start: datetime_start,
                    datetime_stop: datetime_stop,
                    title: r2f($row, 'title'),
                    summary: r2f($row, 'summary'),
                    description: r2f($row, 'long-description'),
                    fee: r2f($row, 'fee'),
                    venue: r2f($row, 'venue'),
                    address: r2f($row, 'address'),
                    eventType: r2f($row, 'event-type'),
                    eventSlot: r2f($row, 'event-slot'),
                    id: getEventId($row),
                    hours: hours,
                    year: datetime_start.getDay(),
                    eventUrl: '#' + r2f($row, 'event-id')
                };
            }

            function makeEventDiv($event) {
                var projectClass = $event.eventType.toLowerCase().replace(/\s/g, "-");

                return '<div style="cursor: pointer;" onclick="navigate(\'' + $event.eventUrl +
                    '\')" class="project ' + projectClass + '" ' +
                    'data-year="' + $event.year + '" ' +
                    'data-eventType="' + $event.eventType + '" ' +
                    'data-eventSlot="' + $event.eventSlot + '" ' +
                    'data-day="' + $event.datetime_start.getDay() + '" ' +
                    'data-date="' + $event.datetime_start.getDate() + '" ' +
                    '><div class="icon">' +
                    '<p style="line-height: 14px;font-size: 10.5px !important;color: black !important; margin-left: 7px;font-family: arial !important; text-shadow: none !important;">' +
                    $event.hours + '<br/>' + $event.title + '<p/>' +
                    '</div>' +
                    '</div>';
            }

            function makeDateDiv($date) {
                var projectClass = 'date';

                return '<div class="project ' + projectClass + '" ' +
                    'data-year="' + $date.year + '" ' +
                    'data-eventType="' + projectClass + '" ' +
                    'data-eventSlot="' + projectClass + '" ' +
                    'data-day="' + $date.day + '" ' +
                    'data-date="' + $date.date + '" ' +
                    '><div class="icon">' + $date.title + '</div>' +
                    '</div>';
            }

            function makeLegendDiv($eventType) {
                var eventTypeId = $eventType.toLowerCase().replace(/\s/g, "-");

                return '<div class="legend ' + eventTypeId + '" ' +
                    'data-eventType="' + eventTypeId + '" ' +
                    '><div class="icon">' + '</div>' +
                    '<p style="line-height: 14px;font-size: 10.5px !important;color: black !important; margin-left: 7px;font-family: arial !important; text-shadow: none !important;">' +
                    $eventType + '<p/>' +
                    '</div>';
            }


            function e2v( e, v )
            {
                var retval = 'invalid;'
                v = "gsx$" + v;
                retval = e[v].$t;
                
                return retval;
            }

            function sortByDate( a, b )
            {
                d1 = parseDate( e2v( a, 'date' ), e2v( a, 'timestart' ) );
                d2 = parseDate( e2v( b, 'date' ), e2v( b, 'timestart' ) );
                return d1 - d2;
            }


            function onSpreadsheetLoaded(json) {

                //figure out how many rows our spreadsheet has
                var len = json.feed.entry.length
                    //alert("Spreadsheet loaded with " + len + " items.");

                json.feed.entry.sort( sortByDate );
                
                var i = 0,
                    projects = [],
                    events = [],
                    dates = [],
                    legend = [],
                    legendSet = {};


                var prevDate = 0;

                while (i < len) {

                    var event = makeEvent(json.feed.entry[i]);

                    if (event.eventType == '' || event.eventType == 'Hidden') {
                        i++;
                        continue;
                    }

                    events.push(event);
                    legendSet[event.eventType] = event.eventType;

                    // sort events by date
                    var newDate = event.datetime_start.getDate();
                    if (newDate != prevDate) {
                        var dateObject = {
                            title: dateToWeekday(event.datetime_start),
                            month: event.datetime_start.getMonth(),
                            day: event.datetime_start.getDay(),
                            year: event.datetime_start.getFullYear(),
                            date: event.datetime_start.getDate(),
                            events: [event]
                        };

                        dates.push(dateObject);
                        projects.push(makeDateDiv(dateObject));

                    } else {
                        dates[dates.length - 1].events.push(event);
                    }

                    projects.push(makeEventDiv(event));

                    // update for next loop
                    i++;
                    prevDate = newDate;
                }


                // convert set to array
                for (var key2 in legendSet) {
                    if (legendSet.hasOwnProperty(key2)) {
                        legend.push(makeLegendDiv(legendSet[key2]));
                    }
                }

                var $containerlegend = $('#containerlegend');

                $containerlegend.append($(legend.join('')));

                //                $containerlegend.isotope({
                //                    itemSelector:'.legend',
                //                    layoutMode: 'row'});


                var $containergrid = $('#containergrid');

                $containergrid.append($(projects.join('')));

                // -------- isotope ---------------- //

                $containerlegend.isotope({
                    // main isotope options
                    itemSelector: '.legend',
                    layoutMode: 'fitRows',
                    // options for masonry layout mode
                    masonry: {
                        columnWidth: '.grid-sizer'
                    }
                });

                $containergrid.isotope({
                    itemSelector: '.project',
                    layoutMode: 'bigGraph',
                    bigGraph: {
                        columnWidth: 140, // size of item
                        rowHeight: 90, // size of item
                        maxRows: 10, // max number of items vertically
                        hgap: 10,
                        vgap: 10,
                        gutterWidth: { // width of gutter, needs to match getSortData names
                            year: 0,
                            scale: 0,
                            title: 0,
                            eventType: 0,
                            eventSlot: 0,
                            day: 0,
                            date: 0

                        }
                    },
                    sortBy: 'date',
                    getSortData: {
                        year: function ($elem) {
                            return $elem.attr('data-year');
                        },
                        title: function ($elem) {
                            var chara = $elem.find('p').text()[0];
                            return isNaN(parseInt(chara)) ? chara : '0';
                        },
                        eventType: function ($elem) {
                            return $elem.attr('data-eventType');
                        },
                        eventSlot: function ($elem) {
                            return $elem.attr('data-eventSlot');
                        },
                        day: function ($elem) {
                            return $elem.attr('data-day');
                        },
                        date: function ($elem) {
                            return $elem.attr('data-date');
                        }
                    }
                });

                var $optionSets = $('#options .option-set'),
                    $optionLinks = $optionSets.find('a');

                $optionLinks.click(function () {
                    var $this = $(this);
                    // don't proceed if already selected
                    if ($this.hasClass('selected')) {
                        return false;
                    }
                    var $optionSet = $this.parents('.option-set');
                    $optionSet.find('.selected').removeClass('selected');
                    $this.addClass('selected');

                    // make option object dynamically, i.e. { filter: '.my-filter-class' }
                    //                    var options = { filter: ':not(.date)' },
                    var options = {
                            filter: '*'
                        },
                        key = $optionSet.attr('data-option-key'),
                        value = $this.attr('data-option-value');
                    // parse 'false' as false boolean
                    value = value === 'false' ? false : value;
                    options[key] = value;
                    if (key === 'layoutMode' && typeof changeLayoutMode === 'function') {
                        // changes in layout modes need extra logic
                        changeLayoutMode($this, options)
                    } else {
                        // otherwise, apply new options
                        $containergrid.isotope(options);
                    }

                    return false;
                });
            }

             // categoryRows custom layout mode
            $.extend($.Isotope.prototype, {

                _bigGraphReset: function () {
                    this.bigGraph = {
                        x: 0,
                        y: 0,
                        height: 0,
                        column: 0,
                        row: 0,
                        gutter: 0,
                        currentCategory: null
                    };
                },

                _bigGraphLayout: function ($elems) {
                    var instance = this,
                        containerWidth = this.element.width(),
                        bigGraphOpts = this.options.bigGraph,
                        sortBy = this.options.sortBy,
                        elemsGroup = {},
                        props = this.bigGraph;

                    // group item elements into categories based on their sorting data
                    $elems.each(function () {
                        var category = $.data(this, 'isotope-sort-data')[sortBy];
                        elemsGroup[category] = elemsGroup[category] || [];
                        elemsGroup[category].push(this);
                    });

                    var group, groupName, groupMaxRows, groupLen,
                        gutterWidth = bigGraphOpts.gutterWidth[sortBy],
                        x, y;
                    // for each group...
                    for (groupName in elemsGroup) {
                        group = elemsGroup[groupName];
                        groupLen = group.length;
                        // make groups look nice, by limiting rows, makes for blockier blocks
                        groupMaxRows = groupLen / Math.ceil(groupLen / bigGraphOpts.maxRows);

                        $.each(group, function (i, elem) {
                            x = props.column * bigGraphOpts.columnWidth + props.gutter * gutterWidth;
                            y = 10 + (props.row * bigGraphOpts.rowHeight);
                            instance._pushPosition($(elem), x, y);

                            if (props.row >= groupMaxRows - 1) {
                                // start a new column
                                props.row = 0;
                                props.column++;
                            } else {
                                props.row++;
                            }
                        });
                        // start a new group
                        if (props.row > 0) {
                            props.row = 0;
                            props.column++;
                        }
                        props.gutter++;

                    }
                    props.gutter--;
                    props.width = props.column * bigGraphOpts.columnWidth + props.gutter * gutterWidth;
                },

                _bigGraphGetContainerSize: function () {
                    bigGraphOpts = this.options.bigGraph;
                    this.bigGraph.column++;
                    return {
                        width: this.bigGraph.width,
                        height: bigGraphOpts.maxRows * bigGraphOpts.rowHeight
                    };
                },

                _bigGraphResizeChanged: function () {
                    return false;
                }

            });

            function filterDates() {
                if ($(this)) {

                }
            }