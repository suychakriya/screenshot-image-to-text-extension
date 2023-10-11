/* global chrome */
import React, { useState } from "react";
import html2canvas from "html2canvas";

function ScreenSnip() {
  const [dragging, setDragging] = useState(false);
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

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
    });
  };
  const takeScreenshot = () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      setImageSrc(dataUrl);
      // setSelectedImage(imageSrc);
    });
  };

  return (
    <>
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
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Snipped Area"
          style={{ marginTop: "20px" }}
        />
      )}
      {/* </div> */}
    </>
  );
}

export default ScreenSnip;
