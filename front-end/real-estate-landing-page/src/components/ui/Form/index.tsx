"use client";

import { cn } from "@/lib/utils";
import React from "react";
import {
  Controller,
  FieldPathValue,
  Path,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";
import { FieldValues } from "react-hook-form";

interface IForm<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: any;
  id: string;
  children: React.ReactNode;
  className?: string;
}

const FormInit = <T extends FieldValues>({
  form,
  onSubmit,
  id,
  children,
  className,
}: IForm<T>) => {
  const { handleSubmit } = form;

  const onSubmitForm = handleSubmit(onSubmit);

  return (
    <form
      id={id}
      onSubmit={onSubmitForm}
      className={cn("space-y-4", className)}
    >
      {children}
    </form>
  );
};

const FormController = <T extends FieldValues>({
  form,
  name,
  children,
  rules,
  defaultValue,
  disabled,
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  children: (field: FieldValues) => React.ReactNode;
  rules?:
    | Omit<
        RegisterOptions<T, Path<T>>,
        "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
      >
    | undefined;
  defaultValue?: FieldPathValue<T, Path<T>>;
  disabled?: boolean;
}) => {
  return (
    <Controller
      name={name}
      control={form.control}
      rules={rules}
      defaultValue={defaultValue}
      disabled={disabled}
      render={({ field }) => <>{children(field)}</>}
    />
  );
};

FormInit.FormController = FormController;

export const Form = FormInit;
