import { useState, useRef, useEffect } from "react";

function App() {
  const [connection, setConnection] = useState({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "",
  });

  const [prompt, setPrompt] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);

  // Auto-scroll to results when response changes
  useEffect(() => {
    if (responseData && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [responseData]);

  const handleConnectionChange = (e) => {
    const { name, value } = e.target;
    setConnection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponseData(null);

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    if (
      !connection.host.trim() ||
      !connection.port.trim() ||
      !connection.user.trim() ||
      !connection.database.trim()
    ) {
      setError("Please fill all required DB connection fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          connection,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setResponseData(null);
      } else {
        setResponseData(data);

        if (data.sql) {
          setHistory((prev) => [
            {
              id: Date.now(),
              prompt,
              sql: data.sql,
              time: new Date().toLocaleString(),
            },
            ...prev.slice(0, 9), // keep max 10 items
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Unable to reach backend. Is FastAPI running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setPrompt(item.prompt);
    setResponseData({ sql: item.sql, data: [] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center px-4 py-6">
      <header className="w-full max-w-6xl mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Talk to DB <span className="text-green-400">[OpenRouter]</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Connect your MySQL database, ask questions in natural language, and
          let the AI generate SQL for you.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Backend: FastAPI · LLM: OpenRouter (
          <span className="font-mono">openai/gpt-4o-mini</span>)
        </p>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        {/* LEFT: Connection + Prompt */}
        <section className="w-full lg:w-2/3 bg-[#111111] border border-gray-800 rounded-2xl p-4 md:p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DB Connection */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Database Connection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">
                    Host *
                  </label>
                  <input
                    type="text"
                    name="host"
                    value={connection.host}
                    onChange={handleConnectionChange}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    placeholder="localhost"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">
                    Port *
                  </label>
                  <input
                    type="text"
                    name="port"
                    value={connection.port}
                    onChange={handleConnectionChange}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    placeholder="3306"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">
                    User *
                  </label>
                  <input
                    type="text"
                    name="user"
                    value={connection.user}
                    onChange={handleConnectionChange}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    placeholder="root"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={connection.password}
                    onChange={handleConnectionChange}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    placeholder="••••••••"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase text-gray-400 mb-1">
                    Database *
                  </label>
                  <input
                    type="text"
                    name="database"
                    value={connection.database}
                    onChange={handleConnectionChange}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    placeholder="talktodb"
                  />
                </div>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Ask your question</h2>
              <p className="text-xs text-gray-500 mb-2">
                Examples: “Show all users”, “Total sales per month from
                orders table”, “List users older than 25”.
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full min-h-[120px] bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                placeholder="Type your SQL-related prompt here..."
              />
            </div>

            {/* Error + Actions */}
            {error && (
              <div className="text-red-400 text-xs bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-black text-sm font-semibold hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Running query..." : "Run Query"}
              </button>
              <p className="text-xs text-gray-500">
                Your DB credentials are only used locally to connect from this
                app.
              </p>
            </div>
          </form>
        </section>

        {/* RIGHT: History + Results */}
        <section className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* History */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-4 shadow-lg h-52 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Query History</h2>
            {history.length === 0 ? (
              <p className="text-xs text-gray-500">
                No history yet. Run a query and it will appear here.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="border border-gray-700 rounded-lg p-2 hover:border-green-400 cursor-pointer"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <p className="text-[0.65rem] text-gray-500 mb-1">
                      {item.time}
                    </p>
                    <p className="line-clamp-2 text-gray-200 mb-1">
                      {item.prompt}
                    </p>
                    <p className="font-mono text-[0.65rem] text-green-400 line-clamp-1">
                      {item.sql}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Results */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-4 shadow-lg flex-1">
            <h2 className="text-lg font-semibold mb-3">Result</h2>

            {!responseData ? (
              <p className="text-xs text-gray-500">
                Run a query to see generated SQL and table output here.
              </p>
            ) : (
              <div ref={scrollRef} className="space-y-3">
                {/* SQL */}
                {responseData.sql && (
                  <div>
                    <p className="font-semibold text-sm mb-1">Generated SQL</p>
                    <div className="bg-black text-green-400 border border-gray-700 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                      {responseData.sql}
                    </div>
                  </div>
                )}

                {/* Non-select message */}
                {responseData.message && (
                  <p className="text-xs text-blue-300 bg-blue-950/40 border border-blue-900 rounded-lg px-3 py-2">
                    {responseData.message}
                  </p>
                )}

                {/* Table */}
                {responseData.data && responseData.data.length > 0 ? (
                  <div className="mt-2 border border-gray-800 rounded-lg overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-900">
                        <tr>
                          {Object.keys(responseData.data[0]).map((key) => (
                            <th
                              key={key}
                              className="px-3 py-2 border-b border-gray-800 text-gray-300 text-center"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {responseData.data.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={
                              rowIndex % 2 === 0 ? "bg-[#1a1a1a]" : "bg-black"
                            }
                          >
                            {Object.values(row).map((value, colIndex) => (
                              <td
                                key={colIndex}
                                className="px-3 py-2 border-b border-gray-900 text-center text-gray-200"
                              >
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !responseData.message && (
                    <p className="text-xs text-gray-500">
                      No rows returned for this query.
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
