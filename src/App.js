import React, { useState, useCallback, useEffect } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const App = () => {
  const [rectangles, setRectangles] = useState([]);
  const [selectedId, selectShape] = useState(null);
  const [newRectangle, setNewRectangle] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const handleMouseDown = (e) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewRectangle({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      fill: `rgb(${Math.random() * 255},${Math.random() * 255},${
        Math.random() * 255
      })`,
      id: `rect${rectangles.length + 1}`,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newRectangle) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewRectangle({
      ...newRectangle,
      width: pos.x - newRectangle.x,
      height: pos.y - newRectangle.y,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newRectangle) return;
    const { x, y, width, height } = newRectangle;
    if (Math.abs(width) > 5 && Math.abs(height) > 5) {
      setRectangles((prev) => {
        return [
          ...prev,
          {
            ...newRectangle,
            x: width < 0 ? x + width : x,
            y: height < 0 ? y + height : y,
            width: Math.abs(width),
            height: Math.abs(height),
          },
        ];
      });
    }
    setNewRectangle(null);
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      setRectangles(rectangles.filter((rect) => rect.id !== selectedId));
      selectShape(null);
    }
  };

  const handleMoveToFront = () => {
    if (selectedId) {
      const selectedRect = rectangles.find((rect) => rect.id === selectedId);
      const otherRects = rectangles.filter((rect) => rect.id !== selectedId);
      setRectangles([...otherRects, selectedRect]);
    }
  };

  const toggleDrawing = () => {
    setIsDrawing(!isDrawing);
    selectShape(null);
  };

  const exportToJson = () => {
    const json = [
      {
        id: "root",
        width: stageSize.width,
        height: stageSize.height,
        x: 0,
        y: 0,
        children: rectangles.map((rect) => rect.id),
      },
      ...rectangles.map((rect) => ({
        id: rect.id,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
        children: [],
      })),
    ];
    return JSON.stringify(json, null, 2);
  };

  const importFromJson = () => {
    try {
      const json = JSON.parse(jsonInput);
      const root = json.find((item) => item.id === "root");
      if (!root) throw new Error("Invalid JSON: no root element found");

      setStageSize({ width: root.width, height: root.height });
      const newRectangles = json
        .filter((item) => item.id !== "root")
        .map((item) => ({
          ...item,
          fill: `rgb(${Math.random() * 255},${Math.random() * 255},${
            Math.random() * 255
          })`,
        }));
      setRectangles(newRectangles);
    } catch (error) {
      console.error("Error importing JSON:", error);
      alert("Invalid JSON format. Please check your input.");
    }
  };

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
        <button onClick={() => alert(exportToJson())}>Export to JSON</button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste JSON here to import"
          rows={5}
          style={{ width: "100%" }}
        />
        <button onClick={importFromJson}>Import from JSON</button>
      </div>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={checkDeselect}
        style={{
          cursor: isDrawing ? "crosshair" : "default",
          border: "1px solid black",
        }}
      >
        <Layer>
          {rectangles.map((rect, i) => (
            <Rectangle
              key={i}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              onSelect={() => {
                if (!isDrawing) selectShape(rect.id);
              }}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
            />
          ))}
          {newRectangle && <Rect {...newRectangle} fill="rgba(0,0,255,0.5)" />}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
