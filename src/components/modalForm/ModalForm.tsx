import { db } from "@/config/firebase";
import { Project } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "../ui/textArea/TextArea";
import { Button } from "../ui/buttons/Button";

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
    window.location.reload();
  };

  return (
    <>
      {openModal && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <div className="bg-white">
            {/* <DialogTrigger>Open</DialogTrigger> */}
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

export default ModalForm;
