"use client";

import { useConversations } from "../services/query";
import MessageItem from "./MessageItem";

const ListChat = () => {
  const { data, isLoading } = useConversations();

  if (isLoading) {
    return <>loading</>;
  }
  console.log("data", data);

  const handleGetMessage = () => {
    console.log("first");
  };

  return (
    <div>
      {data?.data?.results?.map((item) => {
        return (
          <MessageItem
            key={item.id}
            // avatar={item.participants[1]?.}
            title={item.participants[1]?.fullName}
            message={item.lastMessageId?.content}
            time={item.lastMessageId?.updatedAt}
            isRead={item.lastMessageId?.isRead}
            onClick={handleGetMessage}
          />
        );
      })}
    </div>
  );
};

export default ListChat;
