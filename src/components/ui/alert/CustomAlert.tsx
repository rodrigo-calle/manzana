import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./Alert";

type Props = {
  title: string;
  kind: "success" | "error" | "warning" | "info";
  description: string;
};

const CustomAlert = (props: Props) => {
  const { title, kind, description } = props;

  const classByKind = {
    success: "bg-green-200 border-green-500",
    error: "bg-red-200 border-red-500",
    warning: "bg-yellow-200 border-yellow-500",
    info: "bg-blue-200 border-blue-500",
  };

  return (
    <Alert
      variant="default"
      className={`w-96 mt-12 absolute border-2 left-1/2 transform -translate-x-1/2 ${classByKind[kind]}`}
      style={{ borderRadius: "10px" }}
    >
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default CustomAlert;
