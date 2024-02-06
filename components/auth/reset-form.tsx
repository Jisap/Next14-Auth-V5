"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "./card-wrapper";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoginSchema, ResetSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { useState, useTransition } from "react";
import { reset } from "@/actions/reset";


export const ResetForm = () => {

  //const callbackUrl = searchParams.get("callbackUrl");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string |undefined>("")
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({ // Se utiliza useForm de react-hook-form para inicializar el formulario. 
    resolver: zodResolver(ResetSchema),               // Se proporciona el esquema de validación (LoginSchema) 
    defaultValues: {                                  // y los valores predeterminados para los campos del formulario (email y password).
      email: "",
    }
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      reset(values)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);        // Si se envió el email de confirmación y se generó el token de verificación
        })
    })
  };

  return (
    <CardWrapper
      headerLabel="Forgot your password?"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      {/* Se utiliza el componente Form de shadcn al cual se le pasa la configuración de form de react-hook-form */}
      <Form {...form}> 
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"  
        >
          <div className="space-y-4">
            <FormField 
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      disabled={isPending}
                      placeholder="email@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormError message={ error } />
          <FormSuccess message={success} />
          
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            Send Reset email
          </Button>
        </form>
      </Form>
    </CardWrapper>  
  )
}