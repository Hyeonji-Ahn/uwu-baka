'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";

class ColumnData implements DayPilot.CalendarColumnData {
    id: string = "";
    name: string = "";
    blocked?: boolean;
}

export default function ResourceCalendar() {
    const router = useRouter()

    const [calendar, setCalendar] = useState<DayPilot.Calendar>();
    const [datePicker, setDatePicker] = useState<DayPilot.Navigator>();

    const [events, setEvents] = useState<DayPilot.EventData[]>([]);
    const [columns, setColumns] = useState<ColumnData[]>([]);
    const [startDate, setStartDate] = useState<string | DayPilot.Date>("2025-11-04");

    const styles = {
        wrap: {
            display: "flex",
            position: "relative",
            minHeight: "100vh",
        },
        video: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
        },
        left: {
            marginRight: "10px",
        },
        main: {
            flexGrow: "1",
        },
        buttonBox: {
            border: "2px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            margin: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
            textAlign: "center",
        },
        button: {
            padding: "10px 20px",
            margin: "5px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#000000",
            color: "white",
            cursor: "pointer",
            transition: "background-color 0.3s",
        },
        buttonHover: {
            backgroundColor: "#45a049",
        },
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
        { name: "0%", id: 0 },
        { name: "10%", id: 10 },
        { name: "20%", id: 20 },
        { name: "30%", id: 30 },
        { name: "40%", id: 40 },
        { name: "50%", id: 50 },
        { name: "60%", id: 60 },
        { name: "70%", id: 70 },
        { name: "80%", id: 80 },
        { name: "90%", id: 90 },
        { name: "100%", id: 100 },
    ];

    const editEvent = async (e: DayPilot.Event) => {
        const form = [
            { name: "Event text", id: "text", type: "text" },
            { name: "Event color", id: "tags.color", type: "select", options: colors },
            { name: "Progress", id: "tags.progress", type: "select", options: progressValues },
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
                fontColor: "#000000",
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
                                const updatedColumns = columns.map(c => c.id === args.source.id ? { ...c, blocked: !c.blocked } : c);
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
                                const updatedColumns = columns.map(c => c.id === args.source.id ? { ...c, name: modal.result } : c);
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
                fontColor: "#000000",
            },
            {
                id: "progress-text",
                bottom: 5,
                left: 5,
                right: 5,
                height: 40,
                text: progress + "%",
                borderRadius: "5px",
                fontColor: "#000000",
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
                fontColor: "#000000",
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
        const events: DayPilot.EventData[] = [

        ];

        setEvents(events);
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
            <video style={styles.video} autoPlay loop muted>
                <source src="/76YS.mp4" type="video/mp4" />
            </video>
            <div style={styles.left}>
                <div style={styles.buttonBox}>
                    <button style={styles.button} onClick={() => router.push('/landing')}>
                        Landing
                    </button>
                </div>
                <div style={styles.buttonBox}>
                    <button style={styles.button} onClick={() => router.push('/goal_setting')}>
                        Goal Setting
                    </button>
                </div>
                <DayPilotNavigator
                    selectMode={"Day"}
                    showMonths={1}
                    skipMonths={3}
                    onTimeRangeSelected={args => setStartDate(args.start)}
                    controlRef={setDatePicker}
                />
            </div>
            <div style={styles.main}>
                <div className={"toolbar"}>
                    <button onClick={onPreviousClick} className={"mx-4 bg-black-500 text-white hover:bg-gray-600"}>Previous</button>
                    <button onClick={onTodayClick} className={"mx-4 bg-black-500 text-white hover:bg-gray-600"}>Today</button>
                    <button onClick={onNextClick} className={"mx-4 bg-black-500 text-white hover:bg-gray-600"}>Next</button>
                </div>
                <DayPilotCalendar
                    viewType={"Day"}
                    columns={columns}
                    startDate={startDate}
                    events={events}
                    eventBorderRadius={"5px"}
                    headerHeight={80}
                    durationBarVisible={true}
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
    );
}
