import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
//import '../index.css';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => loginWithRedirect()}>Log In</button>;
};

export default LoginButton;
