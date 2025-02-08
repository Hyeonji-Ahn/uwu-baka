'use client';
 
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotMonth, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import { useRouter } from 'next/navigation'
import { HomeIcon } from '@heroicons/react/24/solid'
import { saveJsonToFile } from "../actions";

class ColumnData implements DayPilot.CalendarColumnData {
    id: string = "";
    name: string = "";
    blocked?: boolean;
}

type ScheduleItem = {
    id: number;
    text: string;
    start: string;
    end: string;
  };
  

export default function ResourceCalendar() {
 
    const [calendar, setCalendar] = useState<DayPilot.Calendar>();
    const [datePicker, setDatePicker] = useState<DayPilot.Navigator>();

    const [events, setEvents] = useState<DayPilot.EventData[]>([]);
    const [columns, setColumns] = useState<ColumnData[]>([]);
    const [startDate, setStartDate] = useState<string|DayPilot.Date>("2025-02-04");

    const [jsonData, setJsonData] = useState("");

    let eventId

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



    async function handleSave() {
          try {
              //creates json data
              const data = JSON.parse(jsonData);
              //calls function to save json to file
              const result = await saveJsonToFile(data);
              alert(result.message);
          } catch (error) {
              alert("Invalid JSON format");
          }
      }
    

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

        fetch("/data.json")
        .then((response) => response.json())
        .then((json) => {
            const events: ScheduleItem[] = json.map((item: { id: any; text: any; start: string | number | Date; end: string | number | Date; }) => ({
            id: Number(item.id), // Convert id to a number
            text: item.text,
            start: new Date(item.start).toISOString(), // Ensure correct format
            end: new Date(item.end).toISOString()
            }));
            console.log("Events:", events); // Debugging line
            setEvents(events);
        })
        .catch((error) => console.error("Error loading JSON:", error));
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
        eventId = events.length + 1;
        calendar?.events.add({
            id: eventId,
            text: modal.result,
            start: args.start.value.concat("Z"),
            end: args.end.value.concat("Z"),
            resource: args.resource,
            tags: {}
        });
        eventId++;
        console.log("Events:", events);
        setJsonData(JSON.stringify(events));
        handleSave();
    };

    const onEventMove = async (args: DayPilot.CalendarEventMoveArgs) => {
        const column = columns.find(c => c.id === args.newResource);
        if (column?.blocked) {
            args.preventDefault();
        }
        //console.log("testing");
        //setEvents(events);
    };

    const router = useRouter()

    return (
        <div style={styles.wrap}>
            <video style={styles.video} autoPlay loop muted>
                <source src="/76YS.mp4" type="video/mp4" />
            </video>
            <div style={styles.left} className='ml-3'>
                <div style={styles.buttonBox}>
                    <Link href="/landing">
                        <HomeIcon className="size-9 mx-auto" />
                    </Link>
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
            <div style={styles.main} className='mr-3'>
                <div className={"toolbar"}>
                    <button onClick={onPreviousClick} className={"mx-4 my-3 text-white hover:animate-pulse"}>Previous</button>
                    <button onClick={onTodayClick}   className={"mx-4  text-white hover:bg-gray-600"}>Today</button>
                    <button onClick={onNextClick} className={"mx-4  text-white hover:bg-gray-600"}>Next</button>
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
    )
}