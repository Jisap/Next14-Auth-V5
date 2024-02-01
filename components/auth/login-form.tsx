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
import { LoginSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";


export const LoginForm = () => {

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl")
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string |undefined>("")
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({ // Se utiliza useForm de react-hook-form para inicializar el formulario. 
    resolver: zodResolver(LoginSchema),               // Se proporciona el esquema de validación (LoginSchema) 
    defaultValues: {                                  // y los valores predeterminados para los campos del formulario (email y password).
      email: "",
      password: "",
    }
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if(data?.error){
            form.reset();
            setError(data.error)
          }
          if(data?.success){
            form.reset();
            setSuccess(data.success)
          }
        })
    })
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Dont have an account ?"
      backButtonHref="/auth/register"
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
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>  
  )
}