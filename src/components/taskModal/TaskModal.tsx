import React, { ChangeEvent } from "react";
import { ActivitySubcollection } from "@/types/types";
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import * as z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog/Dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form/Form";
import { Input } from "../ui/input/Input";
import axios from "axios";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select/Select";
import { X } from "@phosphor-icons/react";
import { Button } from "../ui/buttons/Button";
import { Textarea } from "../ui/textArea/TextArea";

type TaskList = {
  name: string;
  description: string;
  createdAt: Timestamp;
}[];

type TaskModalType = {
  projectId: string;
  currentActibityDay: Timestamp;
  taskList: TaskList;
  setCurrentActivity: (currentActivity: ActivitySubcollection) => void;
  currentActivity: ActivitySubcollection | null;
  openTaskModal: boolean;
  setOpenTaskModal: (openTaskModal: boolean) => void;
};

const TaskModal = (props: TaskModalType) => {
  const {
    openTaskModal,
    setOpenTaskModal,
    currentActivity,
    setCurrentActivity,
    taskList,
    currentActibityDay,
    projectId,
  } = props;
  const [fileDataPreview, setFileDataPreview] = React.useState<
    {
      url: string;
      type: string;
    }[]
  >(currentActivity?.media || []);
  const currentReadableDay = new Date().toLocaleDateString();
  const dayActivitySchema = z.object({
    activities: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        createdAt: z.object({
          seconds: z.number(),
          nanoseconds: z.number(),
        }),
      })
    ),
    notes: z.string(),
    media: z.array(z.object({ url: z.string(), type: z.string() })),
    date: z.object({
      seconds: z.number(),
      nanoseconds: z.number(),
    }),
  });

  const form = useForm<z.infer<typeof dayActivitySchema>>({
    resolver: zodResolver(dayActivitySchema),
    defaultValues: {
      activities: currentActivity?.activities || [],
      notes: currentActivity?.notes || "",
      media: currentActivity?.media || [],
      date: currentActibityDay,
    },
  });

  const getImageData = (event: ChangeEvent<HTMLInputElement>) => {
    const dataTransfer = new DataTransfer();

    Array.from(event.target.files!).forEach((image) =>
      dataTransfer.items.add(image)
    );

    const files = dataTransfer.files;
    const displayUrl = URL.createObjectURL(event.target.files![0]);

    return { files, displayUrl };
  };

  const onSelectTaskHandler = (event: string) => {
    if (currentActivity) {
      if (currentActivity.activities.find((task) => task.name === event))
        return;
      const taskSelected = taskList?.find((task) => task.name === event);
      const tasks = currentActivity?.activities || [];
      if (taskSelected) {
        tasks.push(taskSelected);
        setCurrentActivity({ ...currentActivity, activities: tasks });
      }
    } else {
      const taskSelected = taskList?.find((task) => task.name === event);
      const tasks = [];
      if (taskSelected) {
        tasks.push(taskSelected);
        setCurrentActivity({
          activities: tasks,
          notes: "",
          media: [],
          date: currentActibityDay,
        });
      }
    }
  };

  const handleDeleteTask = (taskName: string) => {
    if (!currentActivity) return;

    const newTaskList = currentActivity?.activities.filter(
      (task) => task.name !== taskName
    );
    if (currentActivity) {
      setCurrentActivity({ ...currentActivity, activities: newTaskList });
    }
  };

  const idv4 = uuidv4();
  const onSaveChanges = async (values: z.infer<typeof dayActivitySchema>) => {
    if (!currentActivity) return;

    const subcollectionActivity: ActivitySubcollection = {
      activities: currentActivity?.activities,
      notes: currentActivity?.notes || values.notes,
      media: fileDataPreview,
      date: currentActibityDay,
    };

    const q = query(
      collection(db, "habits", projectId, "activities"),
      where("date", "==", currentActibityDay)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const activityId = querySnapshot.docs[0].id;

      const activityRef = doc(
        db,
        "habits",
        projectId,
        "activities",
        activityId
      );
      await setDoc(activityRef, subcollectionActivity, { merge: true });
      return;
    }

    const activityRef = doc(db, "habits", projectId, "activities", idv4);
    await setDoc(activityRef, subcollectionActivity);
  };

  return (
    <Dialog open={openTaskModal} onOpenChange={setOpenTaskModal}>
      {/* <DialogTrigger>Open</DialogTrigger> */}
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{currentReadableDay}</DialogTitle>
          <DialogDescription className="">
            Las actividades realizadas en este día.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSaveChanges)}>
            <FormField
              control={form.control}
              name="notes"
              render={() => (
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas del día:</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="media"
              render={() => (
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <FormField
                      control={form.control}
                      name="media"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel htmlFor="dropzone-file">
                            Imagenes o videos del día:
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              placeholder=""
                              {...field}
                              onChange={(event) => {
                                const { files, displayUrl } =
                                  getImageData(event);

                                Array.from(files).map((file: any) => {
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append(
                                    "tags",
                                    `codeinfuse, medium, gist`
                                  );
                                  formData.append("upload_preset", "manzana");
                                  formData.append("api_key", "568425813991547");
                                  formData.append(
                                    "timestamp",
                                    String(Date.now() / 1000)
                                  );
                                  axios
                                    .post(
                                      "https://api.cloudinary.com/v1_1/da7ov8jyp/image/upload",
                                      formData,
                                      {
                                        headers: {
                                          "X-Requested-With": "XMLHttpRequest",
                                        },
                                      }
                                    )
                                    .then((response) => {
                                      const data = response.data;
                                      const fileUrl = data.secure_url;
                                      setFileDataPreview((prev) => [
                                        ...prev,
                                        {
                                          url: fileUrl,
                                          type: file.type,
                                        },
                                      ]);
                                    })
                                    .catch((err) => console.log(err));
                                });
                                onChange(fileDataPreview);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="w-full cursor-zoom-in flex flex-row flex-wrap gap-2 mt-3">
              {fileDataPreview.length > 0 &&
                fileDataPreview.map((file, index) => {
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
            <div className="py-2 w-full">
              <Select onValueChange={(e) => onSelectTaskHandler(e)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="¿Qué actividades Hiciste Hoy?" />
                </SelectTrigger>
                <SelectContent className="h-fit w-full bg-white">
                  {taskList?.map((task, index) => {
                    return (
                      <SelectItem key={index} value={task.name}>
                        {task.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="mt-4 p-3 w-full h-60 border rounded-sm overflow-auto">
                {currentActivity?.activities.map((task, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-row justify-between items-center w-fit p-2 bg-blue-200 gap-2 flex-wrap mt-3 ml-3  "
                    >
                      <p className="text-blue-700">{task.name}</p>
                      <div>
                        <X
                          size={18}
                          className="text-blue-700 cursor-pointer"
                          onClick={() => handleDeleteTask(task.name)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 text-sm">
                *Recuerda que puedes agregar nuevas actividades en la sección
                del calendario
              </p>
            </div>
            <Button
              className="bg-slate-50 text-black border border-bg-bg-slate-800 hover:bg-slate-100"
              onClick={() => setOpenTaskModal(!openTaskModal)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-slate-800 text-white hover:bg-slate-900"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Guardar
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
      <DialogFooter className="flex flex-row"></DialogFooter>
    </Dialog>
  );
};

export default TaskModal;
