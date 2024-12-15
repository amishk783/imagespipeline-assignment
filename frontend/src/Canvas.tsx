import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, PencilBrush } from "fabric";
import * as fabric from "fabric";
import { ContrastIcon, Download, Trash2, Upload } from "lucide-react";
import { cn, dataURItoBlob } from "./lib/utils";
import { Slider } from "./components/ui/slider";

export const CanvasBoard = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const [maskImage, setMaskImage] = useState("");

  const [brushRadius, setBrushRadius] = useState(40);
  const [error, setError] = useState("");
  const [uploadedId, setUploadedId] = useState(null);

  const [compare, setCompare] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 1920,
        height: 800,
        isDrawingMode: true,
      });

      fabricCanvas.backgroundColor = "#000000";

      console.log("🚀 ~ useEffect ~ fabricCanvas:", fabricCanvas);

      const eraserBrush = new PencilBrush(fabricCanvas);

      eraserBrush.width = brushRadius;

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

  //file upload
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

            fabricCanvasRef.current.add(fabricImg);
          }
        };
        setOriginalImage(e.target?.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  // create mask
  const exportMask = () => {
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

    setMaskImage(maskDataURL);
  };

  //download Mask
  const downloadMask = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "mask.png";
      link.href = maskImage;
      link.click();

      setCompare(false);
    }
  };
  //clear canvas
  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = "#000000";
      fabricCanvasRef.current.renderAll();
      setOriginalImage(null);
      setCompare(false);
    }
  };

  const handleFileCompare = async () => {
    setCompare(true);
    if (!originalImage || !maskImage) return;

    const formData = new FormData();
    const convertedOriginalImage = dataURItoBlob(originalImage);
    const convertedMaskImage = dataURItoBlob(maskImage);
    formData.append("original_image", convertedOriginalImage);
    formData.append("mask_image", convertedMaskImage);
    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setError(data.message);
      setUploadedId(data.id);
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images. Please try again.");
    }
  };

  return (
    <div className="w-full h-full text-red">
      <div className=" flex flex-col items-center   text-white  w-full justify-center">
        <div className=" flex items-center gap-4  text-white p-5 w-full justify-center">
          <button className="relative flex  gap-2 bg-black  text-blac px-4 z-50 py-2 rounded-md ">
            <Upload />
            Upload Image
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => handleFileChange(event)}
              className=" absolute opacity-0  w-full h-full top-0 left-0 right-0  "
            ></input>
          </button>
          <button
            onClick={downloadMask}
            disabled={originalImage === null}
            className={cn(
              "relative    flex  gap-2 bg-black  text-blac px-4 z-50 py-2 rounded-md ",
              originalImage === null ? "opacity-50" : ""
            )}
          >
            <Download />
            Download Mask Image
          </button>
          <button
            disabled={originalImage === null}
            onClick={() => {
              exportMask();
              handleFileCompare();
            }}
            className={cn(
              "relative    flex  gap-2 bg-black  text-blac px-4 z-50 py-2 rounded-md ",
              originalImage === null ? "opacity-50" : ""
            )}
          >
            <ContrastIcon />
            Compare
          </button>
          <button
            onClick={clearCanvas}
            className={cn(
              "relative flex  gap-2 bg-red-700 items-center text-blac px-4 z-50 py-2 rounded-md",
              originalImage === null && "opacity-50 cursor-not-allowed"
            )}
            disabled={originalImage === null}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
        <div className="flex items-center gap-4 text-black py-2 w-96">
          <p className=" font-medium whitespace-nowrap text-lg">Brush Size:</p>
          <Slider
            value={[brushRadius]}
            onValueChange={(value) => {
              setBrushRadius(value[0]);
            }}
            max={100}
            step={1}
          />
          <p className="text-sm font-medium text-black">{[brushRadius]}px</p>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="">
        <canvas ref={canvasRef} width={500} height={500} className="border" />
      </div>

      {compare && originalImage && (
        <div className="flex w-full">
          <img className="w-1/2" src={originalImage}></img>
          <img className="w-1/2" src={maskImage}></img>
        </div>
      )}
    </div>
  );
};
