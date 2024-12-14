import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, PencilBrush } from "fabric";
import * as fabric from "fabric";

interface ExtendedPencilBrush extends fabric.PencilBrush {
  globalCompositeOperation?: string;
}

export const CanvasBoard = () => {
  const [originalImage, setOriginalImage] = useState();
  const [maskImage, setMaskImage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [brushRadius, setBrushRadius] = useState(40);

  const [compare, setCompare] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 1900,
        height: 800,
        isDrawingMode: true,
      });

      fabricCanvas.backgroundColor = "#000000";

      console.log("🚀 ~ useEffect ~ fabricCanvas:", fabricCanvas);

      const eraserBrush = new PencilBrush(fabricCanvas);

      eraserBrush.width = 40;

      fabricCanvas.freeDrawingBrush = eraserBrush;

      fabricCanvas.on("mouse:move", () => {
        if (!fabricCanvas.contextTop || !fabricCanvas.freeDrawingBrush) return;

        fabricCanvas.freeDrawingBrush.color = "#ffffff";
        fabricCanvas.contextTop.globalCompositeOperation = "destination-out";
      });
      fabricCanvas.on("mouse:down", () => {
        if (!fabricCanvas.contextTop || !fabricCanvas.freeDrawingBrush) return;

        fabricCanvas.freeDrawingBrush.color = "#ffffff";
        fabricCanvas.contextTop.globalCompositeOperation = "destination-out";
      });

      fabricCanvas.on("mouse:up", () => {
        if (!fabricCanvas.contextTop || !fabricCanvas.freeDrawingBrush) return;

        fabricCanvas.freeDrawingBrush.color = "#ffffff";
        fabricCanvas.contextTop.globalCompositeOperation = "source-over";

        const activeObj = fabricCanvas.getActiveObject() as fabric.Image;
        if (activeObj) {
          activeObj.dirty = true;
          fabricCanvas.renderAll();
        }
      });

      fabricCanvas.renderAll();
      fabricCanvasRef.current = fabricCanvas;

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [brushRadius]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event || !event.target.files) return;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = new Image();
        imgElement.src = e.target?.result as string;

        imgElement.onload = () => {
          if (fabricCanvasRef.current) {
            const fabricImg = new FabricImage(imgElement, {
              scaleX: fabricCanvasRef.current.width / imgElement.width,
              scaleY: fabricCanvasRef.current.height / imgElement.height,
            });
            console.log("🚀 ~ handleFileChange ~ fabricImg:", fabricImg);

            fabricCanvasRef.current.add(fabricImg);
          }
        };
        setOriginalImage(e.target?.result);
      };

      reader.readAsDataURL(file);
    }
  };
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportMask = () => {
    // Create a temporary canvas for mask generation

    if (!fabricCanvasRef.current) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = fabricCanvasRef.current.width;
    tempCanvas.height = fabricCanvasRef.current.height;
    const tempContext = tempCanvas.getContext("2d");

    if (!tempContext) return;
  
    tempContext.fillStyle = "black";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  
    const drawnPaths = fabricCanvasRef.current.getObjects();

    if (drawnPaths.length === 0) {
      alert("Please draw on the image first");
      return;
    }

   
    drawnPaths.forEach((path) => {
      const pathElement = path.toObject();
      const fabricPath = new fabric.Path(pathElement.path, {
        stroke: "white",
        strokeWidth: path.strokeWidth,
        fill: "white",
      });

     
      fabricPath.render(tempContext);
    });

    
    const maskDataURL = tempCanvas.toDataURL("image/png");
    // const maskDataURL = fabricCanvasRef.current.toDataURL({
    //   format: "png",
    //   multiplier: 1,
    // });

    setMaskImage(maskDataURL);
  };

  const drawOnMaskCanvas = () => {
    if (!maskCanvasRef.current) return;

    const ctx = maskCanvasRef.current.getContext("2d");
    if (ctx) {
      // Set the background to black
      ctx.fillStyle = "black";
      ctx.fillRect(
        0,
        0,
        maskCanvasRef.current.width,
        maskCanvasRef.current.height
      );

      // Draw the white parts for the mask (where the user has drawn on the image)
      // This can be done based on the user drawing on the canvas or manually.
      // We'll assume that the mask canvas tracks the white drawn parts.
    }
  };

  const filter = new fabric.filters.BlendImage({
    image: originalImage,
    mode: "mask",
    aplha: 1,
  });
  console.log("🚀 ~ CanvasBoard ~ filter:", filter);

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = "#000000";
      fabricCanvasRef.current.renderAll();
    }
  };

  return (
    <div className="w-full h-full text-red">
      <div className=" flex items-center gap-4 p-5">
        <button className="relative    bg-blue-400 text-blac px-4 z-50 py-2 rounded-md ">
          Upload Image
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) => handleFileChange(event)}
            className=" absolute opacity-0  w-full h-full top-0 left-0 right-0  "
          ></input>
        </button>
        <button
          onClick={exportMask}
          className="relative    bg-blue-400 text-blac px-4 z-50 py-2 rounded-md "
        >
          Download Mask Image
        </button>
        <button
          onClick={exportMask}
          className="relative    bg-blue-400 text-blac px-4 z-50 py-2 rounded-md "
        >
          Compare
        </button>
      </div>

      <div className="">
        <canvas ref={canvasRef} width={500} height={500} className="border" />
      </div>
      {maskImage && (
        <a href={maskImage} download="image-with-mask.png">
          <button>Download Masked Image</button>
        </a>
      )}
      {maskImage && <img src={maskImage}></img>}
    </div>
  );
};
