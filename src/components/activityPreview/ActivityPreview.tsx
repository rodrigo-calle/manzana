import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog/Dialog";
import { ActivitySubcollection } from "@/types/types";
import Image from "next/image";
import { Button } from "../ui/buttons/Button";

type ActivityPreviewProps = ActivitySubcollection & {
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
};

const ActivityPreview = (props: ActivityPreviewProps) => {
  const { activities, media, notes, date, setOpenDialog, openDialog } = props;

  const reabableDay = new Date(date.toDate()).toLocaleDateString();

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Actividad del día {reabableDay}</DialogTitle>
          <DialogDescription>
            Las actividades realizadas en este día.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-fit flex flex-col">
          <p className="">¿Qué actividades Hiciste?</p>
          <div className="w-full flex flex-row flex-wrap gap-2 mt-3">
            {activities.map((task, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center w-fit p-2 bg-blue-200 gap-2 flex-wrap mt-3 ml-3  "
                >
                  <p className="text-blue-700">{task.name}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3">Notas del día:</p>
          <p className="text-gray-500">{notes}</p>
          <p className="mt-3">Imagenes o videos del día:</p>
          <div className="w-full cursor-zoom-in flex flex-row flex-wrap gap-2 mt-3">
            {media.map((file, index) => {
              if (file.type.includes("image")) {
                return (
                  <Image
                    key={index}
                    src={file.url}
                    alt="Picture of the author"
                    width={100}
                    height={100}
                    className="h-32 w-32 object-cover"
                  />
                );
              } else {
                return (
                  <video key={index} className="cursor-zoom-in">
                    <source
                      src={file.url}
                      width={100}
                      height={100}
                      className="h-32 w-32 object-cover"
                      type={file.type}
                    />
                  </video>
                );
              }
            })}
          </div>
        </div>
      </DialogContent>
      <DialogFooter className="">
        <Button
          className="bg-slate-800 text-white hover:bg-slate-900"
          type="submit"
          onClick={() => setOpenDialog(!openDialog)}
        >
          Ok
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ActivityPreview;
