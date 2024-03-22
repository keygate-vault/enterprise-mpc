import { useState } from "react";
import { iwallet_backend } from "declarations/iwallet_backend";

function App() {
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [lookupResult, setLookupResult] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    const email = event.target.elements.email.value;
    const name = event.target.elements.name.value;
    const message = await iwallet_backend.register(email, name);
    setRegistrationMessage(message);
    return false;
  }

  async function handleLookup(event) {
    event.preventDefault();
    const email = event.target.elements.lookupEmail.value;
    const result = await iwallet_backend.lookup(email);
    if (result.ok) {
      setLookupResult(`Name: ${result.ok}`);
    } else {
      setLookupResult(`Error: ${result.err}`);
    }
    return false;
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-center mb-8">
        <img src="/logo2.svg" alt="DFINITY logo" className="h-16" />
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Registration Form</h2>
        <form action="#" onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-medium">
              Enter your email:
            </label>
            <input
              id="email"
              alt="Email"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="name" className="block font-medium">
              Enter your name:
            </label>
            <input
              id="name"
              alt="Name"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 font-semibold text-sm bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-200"
          >
            Register
          </button>
        </form>
        {registrationMessage && (
          <p className="mt-4 text-green-600">{registrationMessage}</p>
        )}
      </div>
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Lookup Form</h2>
        <form action="#" onSubmit={handleLookup} className="space-y-4">
          <div>
            <label htmlFor="lookupEmail" className="block font-medium">
              Enter email to lookup:
            </label>
            <input
              id="lookupEmail"
              alt="Lookup Email"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 font-semibold text-sm bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-200"
          >
            Lookup
          </button>
        </form>
        {lookupResult && <p className="mt-4">{lookupResult}</p>}
      </div>
    </main>
  );
}

export default App;
