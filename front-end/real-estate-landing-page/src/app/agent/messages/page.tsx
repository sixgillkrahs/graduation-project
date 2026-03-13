import { MessageSquareMore } from "lucide-react";
import StateSurface from "@/components/ui/state-surface";

const Page = () => {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <StateSurface
        size="compact"
        tone="brand"
        eyebrow="Messages"
        icon={<MessageSquareMore className="h-5 w-5" />}
        title="Select a conversation"
        description="Choose a thread from the left sidebar to review messages and reply."
      />
    </div>
  );
};

export default Page;
