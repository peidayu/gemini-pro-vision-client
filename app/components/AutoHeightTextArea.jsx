import { forwardRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default forwardRef(function AutoHeightTextArea(props, ref) {
  return (
    <TextareaAutosize
      ref={ref}
      type="text"
      className="input"
      autoFocus
      rows={1}
      maxRows={3}
      {...props}
    />
  );
});
