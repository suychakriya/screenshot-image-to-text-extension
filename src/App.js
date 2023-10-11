/* global chrome */
import react, { useCallback, useEffect, useState } from "react";
import { createWorker } from "tesseract.js";
import "./App.css";
import html2canvas from "html2canvas";
import ScreenSnip from "./screenshot";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);

  const worker = createWorker();

  const convertImageToText = useCallback(async () => {
    if (!selectedImage) return;
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(selectedImage);
    setTextResult(data.text);
  }, [worker, selectedImage]);

  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText]);

  const handleChangeImage = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    } else {
      setSelectedImage(null);
      setTextResult("");
    }
  };
  const [dragging, setDragging] = useState(false);
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [capturedImage, setCapturedImage] = useState(null);

  const startDrag = (e) => {
    setDragging(true);
    setRect({
      ...rect,
      top: e.clientY,
      left: e.clientX,
    });
  };

  const drag = (e) => {
    if (!dragging) return;

    setRect({
      ...rect,
      width: e.clientX - rect.left,
      height: e.clientY - rect.top,
    });
  };

  const endDrag = () => {
    setDragging(false);
    capture();
  };

  const capture = () => {
    html2canvas(document.body).then((canvas) => {
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(
        rect.left,
        rect.top,
        rect.width,
        rect.height
      );
      const canvasBlob = document.createElement("canvas");
      const ctxBlob = canvasBlob.getContext("2d");
      canvasBlob.width = rect.width;
      canvasBlob.height = rect.height;
      ctxBlob.putImageData(imageData, 0, 0);
      setCapturedImage(canvasBlob.toDataURL());
      setSelectedImage(capturedImage);
    });
  };

  const takeScreenshot = () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      setImageSrc(dataUrl);
      // setSelectedImage(imageSrc);
    });
  };

  return (
    <div className="App" style={{ width: "full", height: "full" }}>
      <h1>Image to Text</h1>
      <div className="input-wrapper">
        <label htmlFor="upload">Upload Image</label>
        <input
          type="file"
          id="upload"
          accept="image/*"
          onChange={handleChangeImage}
        />
      </div>
      {/* <button onClick={takeScreenshot}>Take Screenshot</button> */}
      <button onClick={takeScreenshot}>Take Screenshot</button>
      <img
        src={imageSrc}
        alt="test"
        onMouseDown={startDrag}
        onMouseMove={drag}
        onMouseUp={endDrag}
        style={{ height: "100vh", position: "relative" }}
      />
      {dragging && (
        <div
          style={{
            position: "absolute",
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            border: "2px dashed red",
            boxSizing: "border-box",
          }}
        ></div>
      )}
      {/* {capturedImage && (
        <img
          src={capturedImage}
          alt="Snipped Area"
          style={{ marginTop: "20px" }}
        />
      )} */}

      <div className="result">
        {selectedImage && (
          <div className="box-image">
            <img src={selectedImage} alt="thumb" />
          </div>
        )}
        {textResult && (
          <div className="box-p">
            <p>{textResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
