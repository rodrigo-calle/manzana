"use client";
import { db } from "@/config/firebase";
import {
  DocumentReference,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import React, { ChangeEvent } from "react";
import "./calendar.css";
import Calendar from "@/components/calendar/Calendar";
import Loader from "@/components/ui/loader/Loader";
import { Button } from "@/components/ui/buttons/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/Dialog";
import { FormProvider, set, useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/Form";
import { Input } from "@/components/ui/input/Input";
import { Textarea } from "@/components/ui/textArea/TextArea";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import { Eye, PlusCircle, X } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { uuid } from "uuidv4";

type TaskList = {
  name: string;
  description: string;
  createdAt: Timestamp;
}[];

type Project = {
  user: DocumentReference;
  name: string;
  description: string;
  createdAt: string;
  tasks: TaskList;
};

type ModalFormProps = {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  type?: "edit" | "new";
};

type TaskModal = {
  projectId: string;
  currentActibityDay: Timestamp;
  taskList: TaskList;
  setCurrentActivity: (currentActivity: ActivitySubcollection) => void;
  currentActivity: ActivitySubcollection | null;
  openTaskModal: boolean;
  setOpenTaskModal: (openTaskModal: boolean) => void;
};

type ActivitySubcollection = {
  activities: TaskList;
  notes: string;
  media: Array<string>;
  date: Timestamp;
};

const ModalForm = (props: ModalFormProps) => {
  const params = useParams();
  const { openModal, setOpenModal, type } = props;

  const newProjectSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    description: z
      .string()
      .min(10, "La descripción debe tener al menos 10 caracteres"),
  });
  const form = useForm<z.infer<typeof newProjectSchema>>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSave = async (values: z.infer<typeof newProjectSchema>) => {
    const { id } = params;
    if (typeof id === "string") {
      const projectSnap = await getDoc(doc(db, "habits", id));
      const projectData = projectSnap.data() as Project;

      const newTask = {
        name: values.name,
        description: values.description,
        createdAt: Timestamp.now(),
      };

      const nameExist = projectData.tasks.find(
        (task) => task.name === newTask.name
      );

      if (nameExist) {
        alert("El nombre de la tarea ya existe");
        return;
      }

      await updateDoc(doc(db, "habits", id), {
        tasks: [...projectData.tasks, newTask],
      });
    }
  };

  return (
    <>
      {openModal && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <div className="bg-white">
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">
                  {type === "edit" ? "Editar tarea" : "Nueva Tarea"}
                </DialogTitle>
                <DialogDescription>
                  {type === "edit"
                    ? "Edite la tarea que desea modificar"
                    : "Registre la nueva tarea que contribuya a este hábito 📖  "}
                </DialogDescription>
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSave)}>
                    <FormField
                      control={form.control}
                      name="name"
                      render={() => (
                        <FormItem>
                          <FormLabel />
                          <FormControl>
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre de Actividad</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ejercicios de piernas.."
                                      {...field}
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
                    <FormField
                      control={form.control}
                      name="description"
                      render={() => (
                        <FormItem>
                          <FormLabel />
                          <FormControl>
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descripción de la tarea</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="sentadillas, zancadas, ..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-500" />
                                </FormItem>
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      className="bg-slate-800 text-white hover:bg-slate-900 mt-4"
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      Registrar
                    </Button>
                  </form>
                </FormProvider>
              </DialogHeader>
            </DialogContent>
          </div>
        </Dialog>
      )}
    </>
  );
};

const TaskModal = (props: TaskModal) => {
  const [preview, setPreview] = React.useState<string>("");
  const {
    openTaskModal,
    setOpenTaskModal,
    currentActivity,
    setCurrentActivity,
    taskList,
    currentActibityDay,
    projectId,
  } = props;
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
    media: z.array(z.string()).or(z.string()).or(z.any()),
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

  const idv4 = uuid();
  const onSaveChanges = async (values: z.infer<typeof dayActivitySchema>) => {
    if (!currentActivity) return;

    const subcollectionActivity: ActivitySubcollection = {
      activities: currentActivity?.activities,
      notes: currentActivity?.notes || values.notes,
      media: [],
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
      <DialogTrigger>Open</DialogTrigger>
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
                            <Input placeholder="" {...field} />
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
                          <FormLabel>Imagenes o videos del día:</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              placeholder=""
                              {...field}
                              onChange={(event) => {
                                const { files, displayUrl } =
                                  getImageData(event);
                                setPreview(displayUrl);
                                onChange(files);
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
              // onClick={onSaveChanges}
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

const Project = () => {
  const params = useParams();
  const { id } = params;
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [openTaskModal, setOpenTaskModal] = React.useState<boolean>(false);
  const [currentActivity, setCurrentActivity] =
    React.useState<ActivitySubcollection | null>(null);
  const [currentActibityDay, setCurrentActivityDay] = React.useState<Timestamp>(
    Timestamp.now()
  );

  React.useEffect(() => {
    const getProject = async (): Promise<void> => {
      setLoading(true);
      if (typeof id === "string") {
        const projectSnap = await getDoc(doc(db, "habits", id));
        const projectData = projectSnap.data() as Project;
        setProject(projectData);
        const q = query(
          collection(db, "habits", id, "activities"),
          where("date", "==", currentActibityDay)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const activity =
            querySnapshot.docs[0].data() as ActivitySubcollection;
          setCurrentActivity(activity);
        }
      }
      setLoading(false);
    };

    getProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActibityDay]);

  if (loading) return <Loader />;

  const handlerDay = () => {
    setOpenTaskModal(!openTaskModal);
  };

  return (
    <>
      {project && (
        <>
          <div className="pt-14 bg-slate-100 h-screen w-full px-4">
            <h1 className="text-2xl mt-7">{project.name}</h1>
            <p className="text-gray-500">{project.description}</p>
            <div className="mt-7 w-full flex flex-row justify-center flex-wrap gap-1">
              <div className="w-fit border-r-2 border-blue-500">
                <Calendar
                  handlerDay={handlerDay}
                  setCurrentActivityDay={setCurrentActivityDay}
                />
              </div>
              <div className="w-4/12 h-full flex flex-col">
                <div className="flex h-28 flex-row justify-start items-center gap-2">
                  <h1 className="text-bold text-lg">
                    Lista de Tareas de Hábito &ldquo;{project.name}&rdquo;
                  </h1>
                  <p className="text-bold text-xl">|</p>
                  <Button
                    className="bg-blue-500 text-white hover:bg-blue-400"
                    onClick={() => setShowModal(!showModal)}
                  >
                    Agregar tarea
                  </Button>
                </div>
                <div className="w-full mt-1 flex flex-col gap-2">
                  {project.tasks?.map((task, index) => {
                    return (
                      <div
                        className="w-full h-24 bg-white rounded-md shadow-md flex flex-row justify-between items-center px-4"
                        key={index}
                      >
                        <div className="flex flex-col">
                          <p className="text-bold text-lg">{task.name}</p>
                          <p className="text-gray-500">
                            {task.description.length < 35
                              ? task.description
                              : task.description
                                  .toString()
                                  .split("", 35)
                                  .join("") + "..."}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {task.createdAt.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-row gap-1">
                          <Eye
                            size={24}
                            className="text-green-500 cursor-pointer"
                          />
                          <PlusCircle
                            size={24}
                            className="text-blue-600 cursor-pointer"
                          />
                          <Trash
                            size={24}
                            className="text-red-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <TaskModal
            openTaskModal={openTaskModal}
            setOpenTaskModal={setOpenTaskModal}
            currentActivity={currentActivity}
            setCurrentActivity={setCurrentActivity}
            taskList={project.tasks}
            currentActibityDay={currentActibityDay}
            projectId={typeof params.id === "string" ? params.id : ""}
          />
          <ModalForm openModal={showModal} setOpenModal={setShowModal} />
        </>
      )}

      {!project && <div>Project not found</div>}
    </>
  );
};

export default Project;
