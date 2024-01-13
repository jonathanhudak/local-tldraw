import "@tldraw/tldraw/tldraw.css";
import "./App.css";
import { Tldraw, useEditor, track } from "@tldraw/tldraw";
import { useEffect, useRef } from "react";
// import JSONCrush from "jsoncrush";
import { v4 as uuidv4 } from "uuid";

const Controls = track(({ persistenceKey }) => {
  const editor = useEditor();
  const idleTimeoutRef = useRef<number | null>(null);

  const resetIdleTimeout = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      if (editor.store) {
        // console.log();
        // const snapshot = editor.store.getSnapshot(); // { changes, source }
        // const crushed = JSONCrush.crush(JSON.stringify(snapshot));
        // const compressed = btoa(crushed);
        // console.log("crushed", crushed);
        // console.log("compressed", compressed);
        const url = new URL(window.location.href);
        url.searchParams.set("id", persistenceKey);
        window.history.pushState({}, "", url.toString());
        // console.log("saved snapshot", result);
      }
    }, 1000);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resetIdleTimeout);
    window.addEventListener("keypress", resetIdleTimeout);

    return () => {
      window.removeEventListener("mousemove", resetIdleTimeout);
      window.removeEventListener("keypress", resetIdleTimeout);
    };
  }, []);

  return (
    <div className="custom-controls">
      <button>save</button>
    </div>
  );
});

function App() {
  const url = new URL(window.location.href);
  const uniqueId = url.searchParams.get("id") || uuidv4();

  return (
    <>
      <div style={{ position: "fixed", inset: 0 }}>
        <Tldraw persistenceKey={uniqueId}>
          <Controls persistenceKey={uniqueId} />
        </Tldraw>
      </div>
    </>
  );
}

export default App;
