import { Dialog, DialogContent, DialogTrigger } from "../ui/Dialog";

interface ModalProps {
  trigger: JSX.Element;
  content: JSX.Element;
}

const Modal = ({ content, trigger }: ModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <div>
        <DialogContent>{content}</DialogContent>
      </div>
    </Dialog>
  );
};

export default Modal;
