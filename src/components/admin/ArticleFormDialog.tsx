import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArticleForm } from "./ArticleForm";

export interface ArticleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  submitButtonText: string;
}

export const ArticleFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  submitButtonText
}: ArticleFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ArticleForm onSubmit={onSubmit} submitButtonText={submitButtonText} />
      </DialogContent>
    </Dialog>
  );
}; 