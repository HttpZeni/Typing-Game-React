import { useRef } from "react";
import Button from "./Button";

interface Props {
  text?: string;
  preferedPrefix?: string;
  onClick?: () => void;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function FileUploader({ text = "Button", preferedPrefix = "", onClick, setFile}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
    onClick?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file !== null && file.toString().startsWith(preferedPrefix)){
      setFile(file);
    }
  };

  return (
    <>
      <Button onClickFunction={handleClick} text={text} />
      <input ref={inputRef} type="file" onChange={handleChange} style={{ display: "none" }}/>
    </>
  );
}
