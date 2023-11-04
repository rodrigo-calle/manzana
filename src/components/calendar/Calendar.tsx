import { Timestamp } from "firebase/firestore";
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
                : " cursor-pointer")
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
  const [currentDay, setCurrentDay] = React.useState<Date>(new Date());
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
    if (dateSelectedIsBeforeToTheCurrentDate) return;
    props.handlerDay(day.date);
    // date to firestore timestamp
    const timestamp = Timestamp.fromDate(day.date);
    // firestore timestamp to date
    const date = timestamp.toDate();
    // console.log({ date, timestamp });
    props.setCurrentActivityDay(timestamp);
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
