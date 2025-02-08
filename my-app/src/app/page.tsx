'use client';

import React, {useEffect, useState} from "react";
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "@daypilot/daypilot-lite-react";

class ColumnData implements DayPilot.CalendarColumnData {
    id: string = "";
    name: string = "";
    blocked?: boolean;
}

export default function ResourceCalendar() {

    const [calendar, setCalendar] = useState<DayPilot.Calendar>();
    const [datePicker, setDatePicker] = useState<DayPilot.Navigator>();

    const [events, setEvents] = useState<DayPilot.EventData[]>([]);
    const [columns, setColumns] = useState<ColumnData[]>([]);
    const [startDate, setStartDate] = useState<string|DayPilot.Date>("2025-11-04");

    const styles = {
        wrap: {
            display: "flex"
        },
        left: {
            marginRight: "10px"
        },
        main: {
            flexGrow: "1"
        }
    };

    const colors = [
        { name: "Dark Green", id: "#228B22" },
        { name: "Green", id: "#6aa84f" },
        { name: "Yellow", id: "#f1c232" },
        { name: "Orange", id: "#e69138" },
        { name: "Crimson", id: "#DC143C" },
        { name: "Light Coral", id: "#F08080" },
        { name: "Purple", id: "#9370DB" },
        { name: "Turquoise", id: "#40E0D0" },
        { name: "Light Blue", id: "#ADD8E6" },
        { name: "Sky Blue", id: "#87CEEB" },
        { name: "Blue", id: "#3d85c6" },
    ];

    const progressValues = [
        {name: "0%", id: 0},
        {name: "10%", id: 10},
        {name: "20%", id: 20},
        {name: "30%", id: 30},
        {name: "40%", id: 40},
        {name: "50%", id: 50},
        {name: "60%", id: 60},
        {name: "70%", id: 70},
        {name: "80%", id: 80},
        {name: "90%", id: 90},
        {name: "100%", id: 100},
    ];

    const editEvent = async (e: DayPilot.Event) => {
        const form = [
            {name: "Event text", id: "text", type: "text"},
            {name: "Event color", id: "tags.color", type: "select", options: colors},
            {name: "Progress", id: "tags.progress", type: "select", options: progressValues },
        ];

        const modal = await DayPilot.Modal.form(form, e.data);
        if (modal.canceled) { return; }

        const updatedEvent = modal.result;

        calendar?.events.update(updatedEvent);
    };

    const contextMenu = new DayPilot.Menu({
        items: [
            {
                text: "Delete",
                onClick: async args => {
                    calendar?.events.remove(args.source);
                },
            },
            {
                text: "-"
            },
            {
                text: "Edit...",
                onClick: async args => {
                    await editEvent(args.source);
                }
            }
        ]
    });

    const onBeforeHeaderRender = (args: DayPilot.CalendarBeforeHeaderRenderArgs) => {
        args.header.areas = [
            {
                right: 5,
                top: "calc(50% - 10px)",
                width: 20,
                height: 20,
                action: "ContextMenu",
                symbol: "icons/daypilot.svg#threedots-v",
                style: "cursor: pointer",
                toolTip: "Show context menu",
                borderRadius: "50%",
                backColor: "#00000033",
                fontColor: "#ffffff",
                padding: 2,
                menu: new DayPilot.Menu({
                    onShow: async args => {
                        const column = columns.find(c => c.id === args.source.id);
                        const items = args.menu.items || [];
                        if (column?.blocked) {
                            items[0].text = "Unblock";
                        }
                        else {
                            items[0].text = "Block";
                        }
                    },
                    items: [
                        {
                            text: "Block",
                            onClick: async (args) => {
                                const updatedColumns = columns.map(c =>  c.id === args.source.id ? { ...c, blocked: !c.blocked } : c);
                                setColumns(updatedColumns);
                            }
                        },
                        {
                            text: "Edit",
                            onClick: async (args) => {
                                const column = columns.find(c => c.id === args.source.id);
                                if (!column) {
                                    return;
                                }
                                const modal = await DayPilot.Modal.prompt("Edit column name:", column.name);
                                if (modal.canceled) {
                                    return;
                                }
                                const updatedColumns = columns.map(c =>  c.id === args.source.id ? { ...c, name: modal.result } : c);
                                setColumns(updatedColumns);
                            }
                        },
                        {
                            text: "Delete",
                            onClick: async (args) => {
                                const updatedColumns = columns.filter(c => c.id !== args.source.id);
                                setColumns(updatedColumns);
                            }
                        }
                    ]
                })
            }
        ];
    };

    const onBeforeCellRender = (args: DayPilot.CalendarBeforeCellRenderArgs) => {
        const column = columns.find(c => c.id === args.cell.resource);
        if (column?.blocked) {
            args.cell.properties.backColor = "#f0f0f0";
        }
    };

    const onBeforeEventRender = (args: DayPilot.CalendarBeforeEventRenderArgs) => {
        const color = args.data.tags && args.data.tags.color || "#3d85c6";
        args.data.backColor = color + "cc";
        args.data.borderColor = "darker";

        const progress = args.data.tags?.progress || 0;

        args.data.html = "";

        args.data.areas = [
            {
                id: "text",
                top: 5,
                left: 5,
                right: 5,
                height: 20,
                text: args.data.text,
                fontColor: "#fff",
            },
            {
                id: "progress-text",
                bottom: 5,
                left: 5,
                right: 5,
                height: 40,
                text: progress + "%",
                borderRadius: "5px",
                fontColor: "#000",
                backColor: "#ffffff33",
                style: "text-align: center; line-height: 20px;",
            },
            {
                id: "progress-background",
                bottom: 10,
                left: 10,
                right: 10,
                height: 10,
                borderRadius: "5px",
                backColor: "#ffffff33",
                toolTip: "Progress: " + progress + "%",
            },
            {
                id: "progress-bar",
                bottom: 10,
                left: 10,
                width: `calc((100% - 20px) * ${progress / 100})`,
                height: 10,
                borderRadius: "5px",
                backColor: color,
            },
            {
                id: "menu",
                top: 5,
                right: 5,
                width: 20,
                height: 20,
                padding: 2,
                symbol: "icons/daypilot.svg#threedots-v",
                fontColor: "#fff",
                backColor: "#00000033",
                borderRadius: "50%",
                style: "cursor: pointer;",
                toolTip: "Show context menu",
                action: "ContextMenu",
            },
        ];
    };

    const onTodayClick = () => {
        datePicker?.select(DayPilot.Date.today());
    };

    const onPreviousClick = () => {
        const previous = new DayPilot.Date(startDate).addDays(-1);
        datePicker?.select(previous);
    };

    const onNextClick = () => {
        const next = new DayPilot.Date(startDate).addDays(1);
        datePicker?.select(next);
    };

    useEffect(() => {

        if (!calendar || calendar.disposed()) {
            return;
        }

        const columns: ColumnData[] = [
            {name: "Resource 1", id: "R1"},
            {name: "Resource 2", id: "R2"},
            {name: "Resource 3", id: "R3"},
            {name: "Resource 4", id: "R4"},
            {name: "Resource 5", id: "R5"},
            {name: "Resource 6", id: "R6"},
            {name: "Resource 7", id: "R7"},
            {name: "Resource 8", id: "R8"},
        ];
        setColumns(columns);

        const events: DayPilot.EventData[] = [
            {
                id: 1,
                text: "Task 1",
                start: "2025-11-04T10:30:00",
                end: "2025-11-04T16:00:00",
                resource: "R1",
                tags: {
                    progress: 60,
                }
            },
            {
                id: 2,
                text: "Task 2",
                start: "2025-11-04T09:30:00",
                end: "2025-11-04T11:30:00",
                resource: "R2",
                tags: {
                    color: "#6aa84f",
                    progress: 100,
                }
            },
            {
                id: 3,
                text: "Task 3",
                start: "2025-11-04T12:00:00",
                end: "2025-11-04T15:00:00",
                resource: "R2",
                tags: {
                    color: "#f1c232",
                    progress: 30,
                }
            },
            {
                id: 4,
                text: "Task 4",
                start: "2025-11-04T11:30:00",
                end: "2025-11-04T14:30:00",
                resource: "R3",
                tags: {
                    color: "#e69138",
                    progress: 60,
                }
            },
        ];

        setEvents(events);

        datePicker?.select("2025-11-04");

    }, [calendar, datePicker]);

    const onTimeRangeSelected = async (args: DayPilot.CalendarTimeRangeSelectedArgs) => {

        const column = columns.find(c => c.id === args.resource);
        if (column?.blocked) {
            calendar?.clearSelection();
            return;
        }

        const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
        calendar?.clearSelection();
        if (modal.canceled) {
            return;
        }
        calendar?.events.add({
            start: args.start,
            end: args.end,
            id: DayPilot.guid(),
            text: modal.result,
            resource: args.resource,
            tags: {}
        });
    };

    const onEventMove = async (args: DayPilot.CalendarEventMoveArgs) => {
        const column = columns.find(c => c.id === args.newResource);
        if (column?.blocked) {
            args.preventDefault();
        }
    };

    return (
        <div style={styles.wrap}>
            <div style={styles.left}>
                <DayPilotNavigator
                    selectMode={"Day"}
                    showMonths={3}
                    skipMonths={3}
                    onTimeRangeSelected={args => setStartDate(args.start)}
                    controlRef={setDatePicker}
                    />
            </div>
            <div style={styles.main}>
                <div className={"toolbar"}>
                    <button onClick={onPreviousClick} className={"btn-light"}>Previous</button>
                    <button onClick={onTodayClick}>Today</button>
                    <button onClick={onNextClick} className={"btn-light"}>Next</button>
                </div>
                <DayPilotCalendar
                    viewType={"Resources"}
                    columns={columns}
                    startDate={startDate}
                    events={events}
                    eventBorderRadius={"5px"}
                    headerHeight={50}
                    durationBarVisible={false}
                    onTimeRangeSelected={onTimeRangeSelected}
                    onEventClick={async args => { await editEvent(args.e); }}
                    contextMenu={contextMenu}
                    onBeforeHeaderRender={onBeforeHeaderRender}
                    onBeforeEventRender={onBeforeEventRender}
                    onBeforeCellRender={onBeforeCellRender}
                    onEventMove={onEventMove}
                    controlRef={setCalendar}
                />
            </div>
        </div>
    )
}