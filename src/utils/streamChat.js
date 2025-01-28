import { chatMessagingApiKey } from "@/constants";
import { StreamChat } from "stream-chat";

export const client = StreamChat.getInstance(chatMessagingApiKey);