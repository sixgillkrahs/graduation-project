import { useSignIn } from "./services/mutation";
import logo from "@assets/logo.svg";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Divider, Image, Link, Switch } from "@heroui/react";
import { getEmailError, getPasswordError } from "@shared/validators/form";
import { useState, type FormEvent } from "react";

const SignIn = () => {
  const { mutate: signIn } = useSignIn();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const newErrors: Record<string, string> = {};
    const passwordError = getPasswordError(data.password);
    const emailError = getEmailError(data.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    if (passwordError) {
      newErrors.password = passwordError;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    signIn({
      email: data.email,
      password: data.password,
      rememberMe: !!data.rememberMe,
    });
    setErrors({});
  };
  return (
    <div className="flex h-full flex-col justify-between px-4 py-5 sm:p-12">
      <div className="flex flex-col-reverse gap-12 sm:flex-col">
        <div className="text-black-900 flex items-center justify-center gap-2 text-2xl font-bold sm:justify-start">
          <Image src={logo} alt="logo" />
          <span>UAA Portal</span>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h1 className="text-black-900 text-3xl font-bold">Nice to see you again</h1>
              <Form className="gap-3!" validationErrors={errors} onSubmit={onSubmit}>
                <Input
                  label="Login"
                  name="email"
                  type="email"
                  size="sm"
                  errorMessage={errors.email}
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  size="sm"
                  errorMessage={errors.password}
                />
                <div className="flex w-full items-center justify-between">
                  <Switch name="rememberMe" size="sm">
                    Remember me
                  </Switch>
                  <Link href="/auth/signup" className="text-primary">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" size="md" className="w-full" color="primary">
                  Sign In
                </Button>
              </Form>
            </div>
            <Divider />
            <Button size="md" className="bg-black-800 w-full text-white">
              Sign Site On
            </Button>
          </div>
          <div className="text-black-900 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Image src={logo} alt="logo" width={24} height={24} />
          <span className="text-black-900 text-center text-sm">UAA Portal</span>
        </div>
        <span className="text-black-900 text-center text-sm">© 2023 UAA Portal</span>
      </div>
    </div>
  );
};

export default SignIn;
