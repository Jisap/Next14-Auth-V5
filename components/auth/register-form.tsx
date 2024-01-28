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
import { RegisterSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";


export const RegisterForm = () => {

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string |undefined>("")
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({ // Se utiliza useForm de react-hook-form para inicializar el formulario. 
    resolver: zodResolver(RegisterSchema),               // Se proporciona el esquema de validación (LoginSchema) 
    defaultValues: {                                  // y los valores predeterminados para los campos del formulario (email y password).
      email: "",
      password: "",
      name: ""
    }
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values)
        .then((data) => {
          setError(data.error)
          setSuccess(data.success)
        })
    })
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account ?"
      backButtonHref="/auth/login"
      showSocial
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="*******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />
          
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            Register
          </Button>
        </form>
      </Form>
    </CardWrapper>  
  )
}