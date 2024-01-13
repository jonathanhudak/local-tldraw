import "@tldraw/tldraw/tldraw.css";
import "./App.css";
import {
  Tldraw,
  useEditor,
  track,
  StoreSnapshot,
  TLRecord,
} from "@tldraw/tldraw";
import { useEffect, useRef, useState } from "react";
// import JSONCrush from "jsoncrush";
import { v4 as uuidv4 } from "uuid";

function useSavedDrawings() {
  const [drawings, setDrawings] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  fetch(`http://localhost:8000`, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      setDrawings(data);
      setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
      console.error("Error:", error);
    });
  return {
    drawings,
    isLoading,
  };
}
const Controls = track(({ persistenceKey }) => {
  const editor = useEditor();
  const [drawingName, setDrawingName] = useState("");
  const onChangeDrawingName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDrawingName(e.target.value);
  };
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoading: isLoadingDrawings, drawings } = useSavedDrawings();
  const resetIdleTimeout = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      if (editor.store && !!persistenceKey) {
        const url = new URL(window.location.href);
        url.searchParams.set("id", persistenceKey);
        window.history.pushState({}, "", url.toString());

        // console.log("saved snapshot", result);
        fetch(`http://localhost:8000/${persistenceKey}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: editor.store.getSnapshot() }),
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }, 1000);
  };

  function saveDrawing() {
    fetch(`http://localhost:8000/${drawingName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: editor.store.getSnapshot() }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const url = new URL(window.location.href);
        url.searchParams.set("id", drawingName);
        window.history.pushState({}, "", url.toString());
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

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
      <label htmlFor="drawingName">Drawing name</label>
      <br />
      <input value={drawingName} onChange={onChangeDrawingName} />
      <br />
      <button onClick={saveDrawing}>Save this drawing</button>
      <br />
      {isLoadingDrawings ? (
        "Loading drawings..."
      ) : (
        <>
          <label className="custom-controls__label" htmlFor="savedDrawings">
            Load a saved drawing
          </label>
          <br />
          <select
            id="savedDrawings"
            defaultValue={persistenceKey}
            className="custom-controls__select"
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("id", e.target.value);
              window.history.pushState({}, "", url.toString());
              window.location.reload();
            }}
          >
            {drawings?.map((drawing) => (
              <option key={drawing} value={drawing}>
                {drawing}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
});

function useStoredSnapshot(persistenceKey: string | undefined) {
  const [isLoading, setIsLoading] = useState(!!persistenceKey);
  const [snapshot, setSnapshot] = useState<
    StoreSnapshot<TLRecord> | undefined
  >();
  useEffect(() => {
    if (persistenceKey) {
      fetch(`http://localhost:8000/${persistenceKey}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setSnapshot(JSON.parse(data.value));
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    }
  }, [persistenceKey]);

  return {
    isLoading,
    snapshot,
  };
}

function App() {
  const url = new URL(window.location.href);
  const persistenceKey = url.searchParams.get("id") || undefined;
  const { isLoading, snapshot } = useStoredSnapshot(persistenceKey);
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div style={{ position: "fixed", inset: 0 }}>
        <Tldraw persistenceKey={persistenceKey} snapshot={snapshot}>
          <Controls persistenceKey={persistenceKey} />
        </Tldraw>
      </div>
    </>
  );
}

export default App;
