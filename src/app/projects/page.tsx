"use client";
import * as React from "react";
import { Button } from "@/components/ui/buttons/Button";
import {
  Card,
  CardContent,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/Form";
import { Input } from "@/components/ui/input/Input";
import { Textarea } from "@/components/ui/textArea/TextArea";
import { Form, FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Timestamp,
  addDoc,
  collection,
  DocumentReference,
  where,
  query,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert/Alert";
import { useAppSelector } from "@/redux/hooks";

type DialogProps = {
  open: boolean;
  // userRef: DocumentReference;
  user: string | null;
  onClose: () => void;
};

// const RegisterForm = () => {
//   const form = useForm();
//   return (
//     <Form>
//       <FormField
//         // control={...}
//         name="..."
//         render={() => (
//           <FormItem>
//             <FormLabel />
//             <FormControl>{/* Your form field */}</FormControl>
//             <FormDescription />
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </Form>
//   );
// };

const RegisterProjectsDialog = (props: DialogProps) => {
  const [displayAlert, setDisplayAlert] = React.useState(false);
  const { open, onClose, user } = props;
  console.log({ user });
  const newProjectSchema = z.object({
    name: z.string().min(3, "Too Short!").max(50, "Too Long!"),
    description: z.string().min(3, "Too Short!").max(50, "Too Long!"),
  });

  const form = useForm<z.infer<typeof newProjectSchema>>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSave = async (values: z.infer<typeof newProjectSchema>) => {
    const { name, description } = values;

    const q = query(collection(db, "users"), where("email", "==", user));
    const userDocs = await getDocs(q);
    const userRef = userDocs.docs[0]?.ref;

    if (!userRef) return;

    const newProject = {
      name,
      description,
      user: userRef,
      createdAt: Timestamp.now(),
    };

    console.log({ newProject });

    await addDoc(collection(db, "habits"), newProject);
    setDisplayAlert(true);
    form.reset();
    onClose();
    setTimeout(() => {
      setDisplayAlert(false);
    }, 4000);
  };

  return (
    <>
      {displayAlert && (
        <Alert
          variant="default"
          className="border-green-500 w-96 mt-12 absolute border-2 bg-green-200 left-1/2 transform -translate-x-1/2 "
          style={{ borderRadius: "10px" }}
        >
          <AlertTitle>Nuevo habito creado</AlertTitle>
          <AlertDescription>
            Es el comienzo de algo grande, tú puedes!! 🚀
          </AlertDescription>
        </Alert>
      )}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Registrar un nuevo proyecto
            </DialogTitle>
            <DialogDescription>
              Esto es el comienzo de algo grande 🚀.
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
                              <FormLabel>Nombre de hábito</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Alimentación saludable"
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
                              <FormLabel>Descripción del hábito</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Alimentación saludable"
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
  const user = useAppSelector((state) => state.auth);

  const [open, setOpen] = React.useState(false);

  return (
    <>
      <RegisterProjectsDialog
        open={open}
        onClose={() => setOpen(!open)}
        user={user}
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
        <ul className="w-full h-fit mt-5 flex flex-row justify-between items-center">
          <li className="w-72 h-fit">
            <Card className="h-full bg-white">
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Projects;
