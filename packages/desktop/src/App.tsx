import { useState } from "react";
import "./styles.css";

function App() {
  const [network, setNetwork] = useState("signet");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Snowside Desktop</h1>
      <p className="text-gray-400 mb-8">Light Client for Bitcoin Drivechains</p>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <label className="block text-sm font-medium mb-2 text-gray-300">Network</label>
        <select 
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mb-4"
        >
          <option value="mainnet">Mainnet</option>
          <option value="testnet">Testnet</option>
          <option value="signet">Signet</option>
        </select>

        <div className="space-y-3 mt-6">
          <div className="flex justify-between">
            <span className="text-gray-400">RPC Status:</span>
            <span className="text-green-400">Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">BMM Status:</span>
            <span className="text-yellow-400">Idle</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
