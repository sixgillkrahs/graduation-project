"use client";

import { getAgentCmsCopy } from "@/lib/agent-cms-copy";
import { MessageSquareMore } from "lucide-react";
import { useLocale } from "next-intl";
import StateSurface from "@/components/ui/state-surface";

const Page = () => {
  const copy = getAgentCmsCopy(useLocale()).messages;

  return (
    <div className="flex h-full items-center justify-center p-6">
      <StateSurface
        size="compact"
        tone="brand"
        eyebrow={copy.title}
        icon={<MessageSquareMore className="h-5 w-5" />}
        title={copy.selectConversationTitle}
        description={copy.selectConversationDescription}
      />
    </div>
  );
};

export default Page;
