import { db } from "@/config/firebase";
import {
  Timestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import React from "react";

type TaskList = {
  name: string;
  description: string;
  createdAt: Timestamp;
}[];

type ActivitySubcollection = {
  activities: TaskList;
  notes: string;
  media: Array<{
    url: string;
    type: string;
  }>;
  date: Timestamp;
};

type CalendarProps = {
  handlerDay: (day: Date) => void;
  setCurrentActivityDay: (day: Timestamp) => void;
  activity: ActivitySubcollection | null;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
};

type CalendarBodyDay = {
  currentMonth: boolean;
  date: Date;
  month: number;
  number: number;
  selected: boolean;
  year: number;
};

type CalendarDay = {
  propDay: Date;
  changeCurrentDay: (day: CalendarBodyDay) => void;
};

const CalendarDays = (props: CalendarDay) => {
  const { propDay, changeCurrentDay } = props;
  const firstDayOfMonth = new Date(
    propDay.getFullYear(),
    propDay.getMonth(),
    1
  );

  const currentDay = new Date();
  // const dateSelectedIsBeforeToTheCurrentDate =
  const weekdayOfFirstDay = firstDayOfMonth.getDay();
  const currentDays = [];

  for (let day = 0; day < 42; day++) {
    if (day === 0 && weekdayOfFirstDay === 0) {
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
    } else if (day === 0) {
      firstDayOfMonth.setDate(
        firstDayOfMonth.getDate() + (day - weekdayOfFirstDay)
      );
    } else {
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
    }

    let calendarDay: CalendarBodyDay = {
      currentMonth: firstDayOfMonth.getMonth() === propDay.getMonth(),
      date: new Date(firstDayOfMonth),
      month: firstDayOfMonth.getMonth(),
      number: firstDayOfMonth.getDate(),
      selected: firstDayOfMonth.toDateString() === propDay.toDateString(),
      year: firstDayOfMonth.getFullYear(),
    };

    currentDays.push(calendarDay);
  }

  return (
    <div className="w-full grow flex flex-wrap justify-center box-border">
      {currentDays.map((day, index) => {
        return (
          <div
            key={index}
            className={
              "calendar-day" +
              (day.currentMonth ? " current" : "") +
              (day.selected ? " selected" : "") +
              (new Date(day.date.toDateString()) <
              new Date(currentDay.toDateString())
                ? " cursor-zoom-in bg-slate-300"
                : " cursor-pointer") +
              (new Date(day.date.toDateString()) >
              new Date(currentDay.toDateString())
                ? " cursor-not-allowed bg-slate-300"
                : "")
            }
            onClick={() => changeCurrentDay(day)}
          >
            <p>{day.number}</p>
          </div>
        );
      })}
    </div>
  );
};

const Calendar = (props: CalendarProps) => {
  const { handlerDay, openDialog, setCurrentActivityDay, setOpenDialog } =
    props;
  const [currentDay, setCurrentDay] = React.useState<Date>(new Date());
  const params = useParams();
  const { id } = params;
  const weekDays = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Setiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const changeCurrentDay = async (day: CalendarBodyDay) => {
    const currentDay = new Date();
    const dayParsed = new Date(day.date.toDateString());
    const currentDayParsed = new Date(currentDay.toDateString());
    const dateSelectedIsBeforeToTheCurrentDate = dayParsed < currentDayParsed;
    const dateSelectedIsAfterToTheCurrentDate = dayParsed > currentDayParsed;
    const timestamp = Timestamp.fromDate(day.date);

    let activity: ActivitySubcollection | null = null;

    if (typeof id === "string") {
      const q = query(
        collection(db, "habits", id, "activities"),
        where("date", "==", timestamp)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        activity = querySnapshot.docs[0].data() as ActivitySubcollection;
      }
    }

    if (dateSelectedIsBeforeToTheCurrentDate) {
      setCurrentActivityDay(timestamp);
      if (!activity) {
        alert("No registraste actividades en este día");
        return;
      }
      setOpenDialog(!openDialog);
      return;
    }

    if (dateSelectedIsAfterToTheCurrentDate) {
      alert("No puedes seleccionar un día que no ha llegado");
      return;
    }
    handlerDay(day.date);
    setCurrentActivityDay(timestamp);
    setCurrentDay(new Date(day.year, day.month, day.number));
  };

  return (
    <div className="bg-slate-100 h-100 w-full calendar flex-row">
      <div
        className="flex flex-col"
        style={{ height: "600px", width: "900px" }}
      >
        <div className="w-full flex items-center" style={{ height: "100px" }}>
          {months[currentDay.getMonth()]} {currentDay.getFullYear()}
        </div>
        <div className="w-full flex-grow flex flex-col">
          <div className="h-full w-full flex items-center justify-around">
            {weekDays.map((day, index) => {
              return (
                <div className="w-24 text-center" key={index}>
                  <p>{day}</p>
                </div>
              );
            })}
          </div>
          <CalendarDays
            propDay={currentDay}
            changeCurrentDay={changeCurrentDay}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
