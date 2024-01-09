"use client";
import { useEffect, useRef, useState } from "react";
import AutoHeightTextArea from "./components/AutoHeightTextArea";
import { Send, Image, Github } from "lucide-react";
import cx from "classnames";
import useImage2Text from "./common/useImage2Text";

export default function Home() {
  const inputRef = useRef();
  const {
    input,
    image,
    messages,
    error,
    isGenerating,
    setImage,
    setInput,
    handleSubmit,
    abort,
  } = useImage2Text();
  const [placeholder, setPlaceholder] = useState("");
  const submitDisabled = isGenerating;
  useEffect(() => {
    setPlaceholder(
      !window.navigator.language.toLowerCase().startsWith("zh")
        ? "Input something"
        : "输入点啥吧"
    );
  }, []);
  return (
    <div className="h-[100svh] bg-white">
      <a
        target="_blank"
        href="https://github.com/peidayu/gemini-pro-vision-client"
        className="github absolute right-4 top-4 text-gray-700 hover:text-gray-950"
      >
        <Github size="20" />
      </a>
      <div className="flex flex-col h-full">
        <div className="messages-container flex-1 py-10 box overflow-y-auto">
          <div className="max-w-5xl max-lg:mx-4 mx-auto min-h-full flex flex-col items-center justify-center transition-all">
            {!image && (
              <label
                htmlFor="file"
                className="flex w-full cursor-pointer border-2 border-gray-200 border-dashed p-10 rounded-md justify-center items-center hover:bg-blue-100/50"
              >
                <div className="text-gray-500">Select Image</div>
              </label>
            )}
            {image && (
              <img
                className="max-w-[500px]  max-h-[400px] object-contain"
                src={URL.createObjectURL(image)}
                alt=""
              />
            )}
            <div className="w-full mt-4">
              {messages.map((message, i) => (
                <div key={i} className="relative my-2 mx-20">
                  <div
                    className={cx(
                      "w-2 h-4 rounded-full absolute -left-4 top-1",
                      message.role === "model" ? "bg-blue-500" : "bg-gray-200",
                      {
                        "animate-bounce":
                          isGenerating && message.role === "model",
                      }
                    )}
                  ></div>
                  <div className="content text-gray-800">{message.content}</div>
                </div>
              ))}
              {error && (
                <div className="text-red-700 py-4 px-10">
                  <div className="font-semibold">Error: </div>
                  {JSON.stringify(error)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="block w-full mx-auto max-w-5xl max-lg:px-4 send-container mb-5 relative">
          <div className="bg-gray-100 rounded-md py-3 px-1 flex flex-row items-center">
            <div className="flex-1">
              <AutoHeightTextArea
                ref={inputRef}
                value={input}
                placeholder={placeholder}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.keyCode === 13 && e.ctrlKey) {
                    setInput((old) => old + "\n");
                  } else if (e.keyCode === 13 && !submitDisabled) {
                    handleSubmit();
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <label
              htmlFor="file"
              className={cx(
                "h-10 w-10 flex items-center justify-center rounded-full mr-3",
                {
                  "cursor-pointer text-gray-600 hover:bg-gray-200":
                    !submitDisabled,
                  "text-gray-300": submitDisabled,
                }
              )}
            >
              <Image size={20} />
              {!submitDisabled && (
                <input
                  className="hidden"
                  accept="image/*"
                  type="file"
                  id="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }
                  }}
                />
              )}
            </label>
            {!isGenerating && (
              <div
                className={cx(
                  "text-white h-10 w-10 flex items-center justify-center rounded-md mr-3 cursor-pointer",
                  {
                    "bg-blue-600 hover:bg-blue-700": !submitDisabled,
                    "cursor-default bg-gray-500": submitDisabled,
                  }
                )}
                onClick={async () => {
                  if (submitDisabled) {
                    return;
                  }
                  handleSubmit();
                }}
              >
                <Send size={20} />
              </div>
            )}
            {isGenerating && (
              <div
                className="w-10 h-10 rounded-full mr-3 bg-gray-400/30 hover:bg-gray-400/40 flex items-center justify-center cursor-pointer"
                onClick={() => {
                  abort();
                }}
              >
                <div className="w-[14px] h-[14px] bg-gray-500 rounded-sm"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
