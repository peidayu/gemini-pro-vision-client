import { useRef, useState, useCallback } from "react";
import { getBase64FromImage, parseSSEStream } from "../utils";

export default function useImage2Text() {
  const cache = useRef({});
  const [image, setImage] = useState();
  const [error, setError] = useState();
  const [input, setInput] = useState("");
  const [tempMessage, setTempMessage] = useState();
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const reset = useCallback(() => {
    setTempMessage(undefined);
    setMessages([]);
    setIsGenerating(false);
    setInput("");
    setError();
  }, []);
  const handleError = useCallback(
    (error) => {
      reset();
      setError(error);
    },
    [reset]
  );
  const handleSubmit = useCallback(async () => {
    if (!image) {
      alert("place select a image");
      return;
    }
    reset();
    setIsGenerating(true);
    cache.current.responseText = "";
    const base64Str = await getBase64FromImage(image);
    setTempMessage({
      role: "model",
      content: "",
    });
    setMessages([
      {
        role: "user",
        content:
          input ||
          (navigator.language.toLowerCase().startsWith("zh")
            ? "这是什么"
            : "describe the image"),
      },
    ]);
    cache.current.abortController = new AbortController();
    const res = await fetch("/vision", {
      method: "POST",
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  input ||
                  (navigator.language.toLowerCase().startsWith("zh")
                    ? "这是什么"
                    : "describe the image"),
              },
              {
                inline_data: {
                  mime_type: "image/webp",
                  data: base64Str,
                },
              },
            ],
          },
        ],
      }),
      signal: cache.current.abortController.signal,
    }).catch((err) => {
      console.log(err);
      if (String(err).indexOf("abort") < 0) {
        handleError({ error: err });
      }
    });
    if (!res) {
      return;
    }
    if (res.status === 200) {
      parseSSEStream(res.body, {
        onMessage: (data) => {
          try {
            cache.current.responseText +=
              data.candidates[0].content.parts[0].text;
            setTempMessage({
              role: "model",
              content: cache.current.responseText,
            });
          } catch (err) {
            console.log(err);
            handleError({ error: err });
          }
        },
        onFinish: () => {
          setIsGenerating(false);
        },
        onError: (error) => {
          handleError({ error });
        },
      });
    } else {
      try {
        const resData = await res.json();
        handleError(resData);
      } catch (err) {
        handleError({ error: "an error has occurred!" });
      }
    }
  }, [input, image]);
  const abort = useCallback(() => {
    if (cache.current.abortController) {
      cache.current.abortController.abort();
      reset();
    }
  }, []);
  return {
    input,
    image,
    messages: messages.concat(tempMessage || []),
    error,
    isGenerating,
    setInput,
    setImage: (file) => {
      reset();
      setImage(file);
    },
    handleSubmit,
    abort,
  };
}
