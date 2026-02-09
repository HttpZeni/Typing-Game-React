import { useState, type ReactElement, type ReactNode, Children, isValidElement, cloneElement } from "react";
import Button from "./Button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface Props {
  children: ReactNode[];
  defaultSelect: number;
  itemsPerRow?: number;
}

export default function ButtonSelection({ children, defaultSelect, itemsPerRow }: Props) {
  const [currentBtnPressed, setCurrentBtnPressed] = useState<number>(defaultSelect);
  const itemsPerRowSafe = typeof itemsPerRow === "number" && itemsPerRow > 0 ? Math.floor(itemsPerRow) : undefined;

  const handleClick = (index?: number) => {
        if (index !== undefined) {
            setCurrentBtnPressed(index);
        }
  };

  const mappedChildren: ReactNode[] = Children.toArray(children).map((child, index) =>
    isValidElement<ButtonProps>(child)
      ? cloneElement(child, {
          index,
          pressed: index === currentBtnPressed,
          onClickFunction: (i?: number) => {
            child.props.onClickFunction?.(i);
            handleClick(i);
          },
        })
      : child
  );

  if (itemsPerRowSafe) {
    const rows: ReactNode[][] = [];
    for (let i = 0; i < mappedChildren.length; i += itemsPerRowSafe) {
      rows.push(mappedChildren.slice(i, i + itemsPerRowSafe));
    }

    return (
      <div className="flex flex-col gap-2 items-start">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-row items-center gap-2">
            {row}
          </div>
        ))}
      </div>
    );
  }

  return <div className="flex flex-row items-center gap-2">{mappedChildren}</div>;
}
