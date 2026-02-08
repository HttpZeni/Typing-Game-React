import { useState, type ReactElement, Children, isValidElement, cloneElement } from "react";
import Button from "./Button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface Props {
  children: ReactElement<ButtonProps>[];
  defaultSelect: number;
}

export default function ButtonSelection({ children, defaultSelect }: Props) {
  const [currentBtnPressed, setCurrentBtnPressed] = useState<number>(defaultSelect);

  const handleClick = (index?: number) => {
        if (index !== undefined) {
            setCurrentBtnPressed(index);
        }
  };

  return (
        <div className="flex flex-row items-center gap-2">
            {Children.map(children, (child, index) =>
                isValidElement<ButtonProps>(child)
                  ? cloneElement(child, {
                        index,
                        pressed: (index === currentBtnPressed),
                        onClickFunction: (i?: number) => {
                            child.props.onClickFunction?.(i);
                            handleClick(i);
                        },
                    })
                : child
            )}
        </div>
  );
}
