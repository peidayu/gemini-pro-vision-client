import { createParser } from "eventsource-parser";

export function getBase64FromImage(file, width = 512) {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const resizedHeight = (image.height * width) / image.width;
      canvas.width = width;
      canvas.height = resizedHeight;
      ctx.drawImage(image, 0, 0, width, resizedHeight);
      resolve(canvas.toDataURL().replace(/.*base64,/, ""));
    };
    image.src = blobUrl;
  });
}

export async function parseSSEStream(
  stream,
  { onMessage = () => {}, onFinish = () => {}, onError = () => {} } = {}
) {
  const parser = createParser(function (event) {
    if (event.type === "event") {
      try {
        onMessage(JSON.parse(event.data));
      } catch (err) {
        onError();
      }
    } else if (event.type === "reconnect-interval") {
      console.log(
        "We should set reconnect interval to %d milliseconds",
        event.value
      );
    }
  });
  const reader = stream.getReader();
  while (1) {
    const { value, done } = await reader.read();
    const textDecoder = new TextDecoder();
    parser.feed(textDecoder.decode(value));
    if (done) {
      onFinish();
      break;
    }
  }
}
