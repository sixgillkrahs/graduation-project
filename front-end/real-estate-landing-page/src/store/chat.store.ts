import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  isOpen: boolean;
  selectedConversation: any | null;
}

const initialState: ChatState = {
  isOpen: false,
  selectedConversation: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChatWidget: (state) => {
      state.isOpen = true;
    },
    closeChatWidget: (state) => {
      state.isOpen = false;
      state.selectedConversation = null;
    },
    openConversation: (state, action: PayloadAction<any>) => {
      state.isOpen = true;
      state.selectedConversation = action.payload;
    },
    closeConversation: (state) => {
      state.selectedConversation = null;
    },
  },
});

export const {
  openChatWidget,
  closeChatWidget,
  openConversation,
  closeConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
