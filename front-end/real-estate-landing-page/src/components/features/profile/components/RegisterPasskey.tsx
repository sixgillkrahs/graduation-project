import { startRegistration } from "@simplewebauthn/browser";
import ProfileService from "../services/service";

const RegisterPasskey = () => {
  const registerPasskey = async () => {
    const options = await ProfileService.registerPasskey();

    // const credential = await startRegistration(options.data);
  };
  return <div></div>;
};

export default RegisterPasskey;
