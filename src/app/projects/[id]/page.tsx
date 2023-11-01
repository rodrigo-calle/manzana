"use client";
import { db } from "@/config/firebase";
import {
  DocumentReference,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import React from "react";
import "./calendar.css";
import Calendar from "@/components/calendar/Calendar";
import Loader from "@/components/ui/loader/Loader";
import { Button } from "@/components/ui/buttons/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/Dialog";
import { FormProvider, useForm } from "react-hook-form";
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
import { Eye, PlusCircle } from "@phosphor-icons/react";

type Project = {
  user: DocumentReference;
  name: string;
  description: string;
  createdAt: string;
  tasks: {
    name: string;
    description: string;
    createdAt: Timestamp;
  }[];
};

type ModalFormProps = {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  type?: "edit" | "new";
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
    console.log(values);
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

const Project = () => {
  const params = useParams();
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showModal, setShowModal] = React.useState<boolean>(false);

  React.useEffect(() => {
    const { id } = params;
    const getProject = async (): Promise<void> => {
      setLoading(true);
      if (typeof id === "string") {
        const projectSnap = await getDoc(doc(db, "habits", id));

        const projectData = projectSnap.data() as Project;

        setProject(projectData);
      }
      setLoading(false);
    };

    getProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader />;

  const handlerDay = () => {
    console.log("hola");
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
                <Calendar handlerDay={handlerDay} />
              </div>
              <div className="w-4/12 h-full flex flex-col">
                <div className="flex h-28 flex-row justify-start items-center gap-2">
                  <h1 className="text-bold text-lg">
                    Lista de Tareas de Hábito
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
          <ModalForm openModal={showModal} setOpenModal={setShowModal} />
        </>
      )}

      {!project && <div>Project not found</div>}
    </>
  );
};

export default Project;
