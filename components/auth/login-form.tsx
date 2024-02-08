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
import Link from "next/link";


export const LoginForm = () => {

  const searchParams = useSearchParams();   // Si hay un error en el login con github o google en los params se incluira un error                      
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Email already in use with different provider!"
    : "";

  //const callbackUrl = searchParams.get("callbackUrl");

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string |undefined>("")
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({ // Se utiliza useForm de react-hook-form para inicializar el formulario. 
    resolver: zodResolver(LoginSchema),               // Se proporciona el esquema de validación (LoginSchema) 
    defaultValues: {                                  // y los valores predeterminados para los campos del formulario (email y password).
      email: "",
      password: "",
      code: ""
    }
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values)
        .then((data) => {
          if(data?.error){
            form.reset();
            setError(data.error);
          }
          if(data?.success){
            form.reset()
            setSuccess(data.success);        // Si se envió el email de confirmación y se generó el token de verificación
          }
          if(data?.twoFactor){               // Si el twoFactor esta habilitado -> showTwoFactor = true -> cambio en el formulario que se muestra  
            setShowTwoFactor(true);
          }
        })
        .catch(() => setError("Something went wrong"));
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
            {showTwoFactor && (                     //Si twoFactor esta habilitado se muestra solo el input del código
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />  
            )}
            { !showTwoFactor && (                    // Si twoFactor no esta habilitado se muestra los inputs el login normal
                <>
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="*******"
                            type="password"
                            />
                        </FormControl>
                        <Button
                          size="sm"
                          variant="link"
                          asChild
                          className="px-0 font-normal"
                          >
                          <Link href="/auth/reset">
                            Forgot password ?
                          </Link>
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                </>
              )
            }
          </div>

          <FormError message={ error || urlError } />
          <FormSuccess message={success} />
          
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            {showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>  
  )
}