import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { iwallet_backend } from "declarations/iwallet_backend";
import { SignIn } from './components/Forms/SignIn/Index'
import { SignUp } from "./components/Forms/SignUp/Index";

function App() {
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [lookupResult, setLookupResult] = useState("");

  // async function handleRegister(event) {
  //   event.preventDefault();
  //   const email = event.target.elements.email.value;
  //   const name = event.target.elements.name.value;
  //   const message = await iwallet_backend.register(email, name);
  //   setRegistrationMessage(message);
  //   return false;
  // }
  //
  // async function handleLookup(event) {
  //   event.preventDefault();
  //   const email = event.target.elements.lookupEmail.value;
  //   const result = await iwallet_backend.lookup(email);
  //   if (result.ok) {
  //     setLookupResult(`Name: ${result.ok}`);
  //   } else {
  //     setLookupResult(`Error: ${result.err}`);
  //   }
  //   return false;
  // }

  const onSignIn = (values: any) => {
    console.log('onSignIn', values)
  }

  const onSignUp = (values: any) => {
    console.log('onSignUp', values)
  }

  return (
    <BrowserRouter>
      <main className="flex justify-center items-center h-[100vh] bg-gradient-to-b from-[#F9FAFA] to-[#EBF0F1]">
        <div className="w-full max-w-md px-8">
          <Routes>
            <Route path="/sign-in" element={<SignIn onSignIn={onSignIn} />} />
            <Route path="/sign-up" element={<SignUp onSignUp={onSignUp} />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;
