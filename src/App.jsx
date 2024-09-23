import React, { useState } from "react";
import { StagingArea } from "./components/stage";

const App = () => {
  const [rectangles, setRectangles] = useState([]);
  const [selectedId, selectShape] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const toggleDrawing = () => {
    setIsDrawing((prev) => !prev);
    selectShape(null);
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      setRectangles((rects) => rects.filter((rect) => rect.id !== selectedId));
      selectShape(null);
    }
  };

  const handleMoveToFront = () => {
    if (selectedId) {
      const selectedRect = rectangles.find((rect) => rect.id === selectedId);
      const otherRects = rectangles.filter((rect) => rect.id !== selectedId);
      setRectangles([...otherRects, selectedRect]);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={toggleDrawing}
          style={{ backgroundColor: isDrawing ? "lightblue" : "white" }}
        >
          {isDrawing ? "Cancel Drawing" : "Add Rectangle"}
        </button>
        <button onClick={handleDeleteSelected} disabled={!selectedId}>
          Delete Selected
        </button>
        <button onClick={handleMoveToFront} disabled={!selectedId}>
          Move to Front
        </button>
      </div>
      <StagingArea
        stageSize={stageSize}
        selectedId={selectedId}
        selectShape={selectShape}
        isDrawing={isDrawing}
        rectangles={rectangles}
        setRectangles={setRectangles}
      />
    </div>
  );
};

export default App;
