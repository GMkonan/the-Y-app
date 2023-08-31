import { Button as UiButton } from "../ui/Button";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children?: React.ReactNode;
  // ... your custom props here
}

const Button = ({ children, ...props }: ButtonProps) => {
  return <UiButton {...props}>{children}</UiButton>;
};

export default Button;
