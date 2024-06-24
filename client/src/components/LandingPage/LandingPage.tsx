import { useState } from "react";
import { BACKEND_SERVICE_URL, slug_words } from "../../config";
import { useNavigate } from "react-router-dom";

function getRandomSlug() {
  let slug = "";
  for (let i = 0; i < 3; i++) {
    slug += slug_words[Math.floor(Math.random() * slug_words.length)];
  }
  return slug;
}

function LandingPage() {
  const [replId, setReplId] = useState(getRandomSlug());
  const [language, setLanguage] = useState("node-js");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  return (
    <section className="h-screen w-full  flex items-center justify-center  bg-slate-950">
      <div className="flex flex-col w-[420px]  space-y-5">
        <h1 className="text-3xl text-slate-200 font-bold">Create a Project</h1>
        <input
          className="bg-slate-100 p-2 border-2 border-red-100"
          type="text"
          placeholder="Enter you slug"
          value={replId}
          onChange={(e) => setReplId(e.target.value)}
        />
        <div id="langOptionsContainer" className="flex items-center gap-2">
          <p className="text-md font-bold text-slate-200">
            Choose you tech stack:
          </p>
          <select
            className="bg-slate-100 cursor-pointer p-2"
            name="language"
            id="language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="node-js">Node.js</option>
            <option value="python">python</option>
          </select>
        </div>
        <div className="flex justify-center">
          <button
            className="bg-slate-600 hover:bg-slate-700 p-2 px-5 rounded-md text-white"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const response = await fetch(
                `${BACKEND_SERVICE_URL}/api/v1/project/create`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ replId, language }),
                }
              );
              if (!response.ok) {
                throw new Error("Something went wrong");
              }
              setLoading(false);
              navigate(`/coding?replId=${replId}`);
            }}
          >
            {loading ? "Starting..." : "Start Coding"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
