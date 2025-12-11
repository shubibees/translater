"use client";
import TextEditor from "./components/TextEditor";
import { useEffect, useState, useRef, useCallback } from "react";

export default function Home() {
  const [content, setContent] = useState({ textContaint: "", htmlContent: "" });
  const [modelStatus, setModelStatus] = useState("idle");
  const worker = useRef<Worker | null>(null);

  function textUpdate(text: string) {
    setContent((data) => ({ ...data, textContaint: text }));
  }

  function htmlUpdate(text: string) {
    setContent((data) => ({ ...data, htmlContent: text }));
  }

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("./worker.js", import.meta.url));
    }

    const onMessageReceived = (e: MessageEvent) => {
      switch (e.data.status) {
        case "initialize":
          setModelStatus("initialize");
          break;

        case "model-upload":
          setModelStatus("model-upload");
          break;

        case "complete":
          setModelStatus("complete");
          htmlUpdate(e.data.output?.[0]?.translation_text || "");
          break;

        default:
          console.error("Invalid status:", e.data.status);
      }
    };

    worker.current.addEventListener("message", onMessageReceived);

    return () => {
      worker.current?.removeEventListener("message", onMessageReceived);
    };
  });

  const classify = useCallback((text: string) => {
    worker.current?.postMessage({ text });
  }, []);

  return (
    <>
      <div className="container-bar flex items-center justify-between p-2">
        <p className="text-amber-50 font-extrabold text-2xl">
          Model Status:{" "}
          <span className="p-1 backdrop-grayscale-0">{modelStatus}</span>
        </p>

        <button
          className="button"
          onClick={() => classify(content.htmlContent)}
        >
          produce html
        </button>
      </div>

      <div className="container grid grid-cols-2 w-full gap-2.5">
        <TextEditor value={content.textContaint} isHandle={textUpdate} />
        <TextEditor value={content.htmlContent} isHandle={htmlUpdate} />
      </div>
    </>
  );
}
