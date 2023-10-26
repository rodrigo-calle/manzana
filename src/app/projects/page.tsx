"use client";
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

import * as React from "react";
import { Form, FormProvider, useForm } from "react-hook-form";

type DialogProps = {
  open: boolean;
  onClose: () => void;
};

const RegisterForm = () => {
  const form = useForm();
  return (
    <Form>
      <FormField
        // control={...}
        name="..."
        render={() => (
          <FormItem>
            <FormLabel />
            <FormControl>{/* Your form field */}</FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

const RegisterProjectsDialog = (props: DialogProps) => {
  const { open, onClose } = props;
  const { control } = useForm();
  console.log(open);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Registrar un nuevo proyecto
          </DialogTitle>
          <DialogDescription>
            Esto es el comienzo de algo grande 🚀 .{/* <Form> */}
            {/* </Form> */}
            <FormProvider>
              <Form control={control}>
                <FormField
                  control={control}
                  name="..."
                  render={() => (
                    <FormItem>
                      <FormLabel />
                      <FormControl>Your form field</FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </FormProvider>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const Projects = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <RegisterProjectsDialog open={open} onClose={() => setOpen(!open)} />
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
