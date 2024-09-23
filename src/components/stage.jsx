import React, { useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Rectangle from "./rectangle";
import config from "../config";

export const StagingArea = ({
  stageSize,
  selectedId,
  selectShape,
  isDrawing,
  rectangles,
  setRectangles,
}) => {
  // for new rectangles that are drawn
  const [newRectangle, setNewRectangle] = useState(null);

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
      fill: config.Rect.getFill(),
      id: `rect${rectangles.length + 1}`,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newRectangle) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewRectangle((newRect) => {
      return {
        ...newRect,
        width: pos.x - newRect.x,
        height: pos.y - newRect.y,
      }
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

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={checkDeselect}
      style={{
        cursor: isDrawing ? "crosshair" : "default",
        // border: "1px solid black",
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
        {newRectangle && <Rect {...newRectangle} fill={config.Rect.getNewFill()} />}
      </Layer>
    </Stage>
  );
};
