import { useSignIn } from "./services/mutation";
import logo from "@/assets/logo.svg";
import { Button, Divider, Form, Image, Input, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { Link, useNavigate } from "react-router-dom";

const { Item } = Form;
const { Password } = Input;

const SignIn = () => {
  const { mutateAsync: signIn, isPending } = useSignIn();
  const navigate = useNavigate();
  const [form] = useForm<ISignInService.SignInRequest>();

  const onSubmit = async (values: ISignInService.SignInRequest) => {
    const resp = await signIn(values);
    if (resp.success) {
      navigate("/dashboard", { replace: true });
    }
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
              <Form
                onFinish={onSubmit}
                className="gap-3!"
                layout="vertical"
                form={form}
                autoComplete="off"
                initialValues={{
                  rememberMe: false,
                }}
              >
                <Item
                  name="username"
                  rules={[{ required: true, message: "Please input your email!", type: "email" }]}
                  label="Email"
                >
                  <Input type="email" size="large" />
                </Item>
                <Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Password size="large" />
                </Item>
                <div className="mb-6 flex w-full items-center justify-between">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                      <Switch size="default" />
                    </Form.Item>

                    <span style={{ cursor: "pointer" }} onClick={() => {}}>
                      Remember me
                    </span>
                  </div>
                  <Link to="/auth/signup" className="text-primary">
                    Forgot password?
                  </Link>
                </div>
                <Button
                  className="w-full"
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isPending}
                >
                  Sign In
                </Button>
              </Form>
            </div>
            <Divider />
            <Button className="bg-black-800 w-full text-white" size="large">
              Sign Site On
            </Button>
          </div>
          <div className="text-black-900 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/auth/sign-up" className="text-primary">
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
