import { useCallback, useEffect, useState } from 'react';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';

const RECTANGLE_CONFIG = {
  fill: 'rgba(0,0,255,0.3)',
  stroke: 'blue',
  strokeWidth: 2,
  selectable: true,
  hasControls: true,
};

const useDrawingCanvas = () => {
  const { editor, onReady } = useFabricJSEditor();
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingState, setDrawingState] = useState({
    startX: 0,
    startY: 0,
    rect: null,
  });

  const handleMouseDown = useCallback((options) => {
    if (!isDrawing || !editor?.canvas) return;

    const pointer = editor.canvas.getPointer(options.e);
    // Use window.fabric instead of direct fabric import
    const rect = new window.fabric.Rect({
      ...RECTANGLE_CONFIG,
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      rx: 10,
      ry: 10,
      objectCaching: false,
    });

    rect.on('scaling', function () {
      this.set({
        width: this.width * this.scaleX,
        height: this.height * this.scaleY,
        scaleX: 1,
        scaleY: 1
      })
    })

    editor.canvas.add(rect);

    setDrawingState({
      startX: pointer.x,
      startY: pointer.y,
      rect,
    });
  }, [editor, isDrawing]);

  const handleMouseMove = useCallback((options) => {
    if (!isDrawing || !editor?.canvas || !drawingState.rect) return;

    const pointer = editor.canvas.getPointer(options.e);
    const { startX, startY, rect } = drawingState;

    const width = Math.abs(pointer.x - startX);
    const height = Math.abs(pointer.y - startY);

    rect.set({
      width,
      height,
      left: pointer.x < startX ? pointer.x : startX,
      top: pointer.y < startY ? pointer.y : startY,
    });

    editor.canvas.renderAll();
  }, [editor, isDrawing, drawingState]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setDrawingState(prev => ({ ...prev, rect: null }));
  }, []);

  useEffect(() => {
    if (!editor?.canvas) return;

    editor.canvas.on('mouse:down', handleMouseDown);
    editor.canvas.on('mouse:move', handleMouseMove);
    editor.canvas.on('mouse:up', handleMouseUp);

    return () => {
      if (editor?.canvas) {
        editor.canvas.off('mouse:down', handleMouseDown);
        editor.canvas.off('mouse:move', handleMouseMove);
        editor.canvas.off('mouse:up', handleMouseUp);
      }
    };
  }, [editor, handleMouseDown, handleMouseMove, handleMouseUp]);

  const startDrawing = useCallback(() => {
    setIsDrawing(true);
  }, []);

  const deleteSelectedObject = useCallback(() => {
    if (!editor?.canvas) return;

    const activeObject = editor.canvas.getActiveObject();
    if (activeObject) {
      editor.canvas.remove(activeObject);
      editor.canvas.renderAll();
    }
  }, [editor]);

  return {
    editor,
    onReady,
    startDrawing,
    deleteSelectedObject,
  };
};

const App = () => {
  const { onReady, startDrawing, deleteSelectedObject } = useDrawingCanvas();

  return (
    <div className="p-4">
      <div className="space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={startDrawing}
        >
          Draw Rectangle
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={deleteSelectedObject}
        >
          Delete Selected Rectangle
        </button>
      </div>
      <div className="border border-gray-300 rounded">
        <FabricJSCanvas
          className="w-[800px] h-[600px]"
          onReady={onReady}
        />
      </div>
    </div>
  );
};

export default App;