"use client";
import * as React from "react";
import { Button } from "@/components/ui/buttons/Button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/Dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/Form";
import { Input } from "@/components/ui/input/Input";
import { Textarea } from "@/components/ui/textArea/TextArea";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Timestamp,
  addDoc,
  collection,
  DocumentReference,
  where,
  query,
  getDocs,
  DocumentData,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert/Alert";
import { useAuthState } from "react-firebase-hooks/auth";
import Loader from "@/components/ui/loader/Loader";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import { ArrowSquareOut, Pencil } from "@phosphor-icons/react";
import CustomTooltip from "@/components/ui/tootip/Tooltip";
import Link from "next/link";
import { Project } from "@/types/types";

type DialogProps = {
  open: boolean;
  userRef: DocumentReference<DocumentData, DocumentData> | undefined;
  type: "new" | "edit";
  projectRef?: DocumentReference<DocumentData, DocumentData>;
  onClose: () => void;
};

const RegisterProjectsDialog = (props: DialogProps) => {
  const { open, onClose, userRef, type, projectRef } = props;
  const [displayAlert, setDisplayAlert] = React.useState(false);

  const newProjectSchema = z.object({
    name: z.string().min(3, "Too Short!").max(50, "Too Long!"),
    description: z.string().min(3, "Too Short!").max(100, "Too Long!"),
  });

  const form = useForm<z.infer<typeof newProjectSchema>>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    const gettingProjectValues = async () => {
      if (!projectRef) return;

      const projectDoc = await getDoc(projectRef);

      const data = projectDoc.data();

      if (!data) return;

      const { name, description } = data;

      form.setValue("name", name);
      form.setValue("description", description);
    };

    if (type === "edit" && projectRef) {
      gettingProjectValues();
    }
  }, [form, projectRef, type]);

  const onSave = async (values: z.infer<typeof newProjectSchema>) => {
    const { name, description } = values;

    if (type === "edit" && projectRef) {
      setDisplayAlert(true);
      await updateDoc(projectRef, {
        ...values,
      });
      onClose();
      setTimeout(() => {
        setDisplayAlert(false);
      }, 4000);
    } else {
      if (!userRef) return;

      const newProject = {
        name,
        description,
        user: userRef,
        createdAt: Timestamp.now(),
        tasks: [],
      };

      await addDoc(collection(db, "habits"), newProject);
      setDisplayAlert(true);
      form.reset();
      onClose();
      setTimeout(() => {
        setDisplayAlert(false);
      }, 4000);
    }
  };

  return (
    <>
      {displayAlert && (
        <Alert
          variant="default"
          className="border-green-500 w-96 mt-12 absolute border-2 bg-green-200 left-1/2 transform -translate-x-1/2 "
          style={{ borderRadius: "10px" }}
        >
          <AlertTitle>
            {(type === "edit" && "Proyecto actualizado correctamente") ||
              "Proyecto registrado correctamente"}
          </AlertTitle>
          <AlertDescription>
            {(type === "edit" &&
              "El proyecto se ha actualizado correctamente") ||
              "El proyecto se ha registrado correctamente"}
          </AlertDescription>
        </Alert>
      )}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {type === "edit" ? "Editar proyecto" : "Nuevo proyecto"}
            </DialogTitle>
            <DialogDescription>
              {type === "edit"
                ? "Edite el proyecto que desea modificar"
                : "Registre un nuevo proyecto, Esto es el comienzo de algo grande 🚀 "}
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
                              <FormLabel>Nombre de proyecto</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Leer Hábitos Atómicos"
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
                              <FormLabel>Descripción del proyecto</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Leer hábitos atómicos para comenzar a crear hábitos de forma correcta"
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
      </Dialog>
    </>
  );
};

const Projects = () => {
  const [userRef, setUserRef] = React.useState<DocumentReference>();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const router = useRouter();
  const [displayAlert, setDisplayAlert] = React.useState(false);
  const [user, loading, error] = useAuthState(auth);
  const [open, setOpen] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [projectsLoader, setProjectsLoader] = React.useState(false);
  const [projectRef, setProjectRef] = React.useState<
    DocumentReference | undefined
  >(undefined);

  const getUserReference = async (userEmail: string) => {
    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const userDocs = await getDocs(q);

    const usertRef = userDocs.docs[0]?.ref;
    return usertRef;
  };

  const deleteProject = (projectRef: DocumentReference) => {
    deleteDoc(projectRef).then(() => {
      window.location.reload();
    });
  };

  React.useEffect(() => {
    if (user && user.email) {
      getUserReference(user.email).then((userRef) => {
        setUserRef(userRef);
      });
    }

    if (error) {
      setDisplayAlert(true);
      setTimeout(() => {
        setDisplayAlert(false);
      }, 4000);
    }
  }, [error, user]);

  React.useEffect(() => {
    const getProjects = async (): Promise<void> => {
      setProjectsLoader(true);
      if (!userRef) return;

      const q = query(collection(db, "habits"), where("user", "==", userRef));

      const habits = await getDocs(q);

      if (!habits.empty) {
        const projectList = habits.docs.map((doc) => {
          const data = doc.data();

          const dataToSave: Project = {
            user: doc.ref,
            name: data.name,
            description: data.description,
            createdAt: data.createdAt,
            tasks: [],
          };
          return dataToSave;
        });
        setProjects(projectList);
      } else {
        setProjects([]);
        setProjectsLoader(false);
        return;
      }
      setProjectsLoader(false);
    };
    if (!openEdit || !open) {
      getProjects();
    }
  }, [open, openEdit, userRef]);

  if (loading) return <Loader />;

  if (!user || !user.email) return router.push("/");

  return (
    <>
      <RegisterProjectsDialog
        type="new"
        open={open}
        onClose={() => setOpen(!open)}
        userRef={userRef}
      />
      <RegisterProjectsDialog
        type="edit"
        open={openEdit}
        onClose={() => setOpenEdit(!openEdit)}
        userRef={userRef}
        projectRef={projectRef}
      />
      <div className="pt-14 bg-slate-100 h-screen w-full px-4">
        <h1 className="text-2xl font-bold mt-5">Mis Proyectos</h1>
        <Button
          className="bg-white hover:bg-slate-50 mt-4"
          onClick={() => setOpen(!open)}
        >
          Crear Nuevo Proyecto
        </Button>
        <div className="w-full mt-5 border-2 border-slate-300 rounded-md" />
        <ul className="w-full h-fit mt-5 flex flex-row justify-start items-center gap-5 flex-wrap">
          {user &&
            userRef &&
            projects.length > 0 &&
            projects.map((project, index) => (
              <Link key={index} href={`/projects/${project.user.id}`} className="cursor-pointer">
                <li className="w-72 h-fit">
                  <Card className="h-full bg-white">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex w-full flex-row justify-end gap-2">
                      <CustomTooltip hover="Eliminar">
                        <Button
                          className="rounded-full w-9 h-9 p-0"
                          onClick={() => deleteProject(project.user)}
                        >
                          <Trash size={24} className="text-red-400" />
                        </Button>
                      </CustomTooltip>
                      <CustomTooltip hover="Editar">
                        <Button
                          className="rounded-full w-9 h-9 p-0"
                          onClick={() => {
                            setProjectRef(project.user);
                            setOpenEdit(true);
                          }}
                        >
                          <Pencil size={24} className="text-green-400" />
                        </Button>{" "}
                      </CustomTooltip>
                      <CustomTooltip hover="Ver Hábito">
                        <Link href={`/projects/${project.user.id}`}>
                          <Button className="rounded-full w-9 h-9 p-0">
                            <ArrowSquareOut
                              size={24}
                              className="text-blue-400"
                            />
                          </Button>
                        </Link>
                      </CustomTooltip>
                    </CardFooter>
                  </Card>
                </li>
              </Link>
            ))}{" "}
          {projectsLoader && (
            <div className="w-full h-full flex justify-center items-center">
              <Loader />
            </div>
          )}
          {projects.length === 0 && !projectsLoader && (
            <p className="w-full text-center">
              No hay proyectos registrados, registre uno
            </p>
          )}
        </ul>
      </div>
    </>
  );
};

export default Projects;
