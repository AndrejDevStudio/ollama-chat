import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@shared/types';
import ChatForm from './ChatForm';
import WelcomeTitle from './WelcomeTitle';

interface ChatFormContainerProps {
  isChatStarted: boolean;
  setIsChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoadingAssistantMessage: boolean;
  setIsLoadingAssistantMessage: React.Dispatch<React.SetStateAction<boolean>>;
  clearErrorMessage: () => void;
  updateErrorMessage: (message: string) => void;
}

export default function ChatFormContainer({
  isChatStarted,
  setIsChatStarted,
  messages,
  setMessages,
  isLoadingAssistantMessage,
  setIsLoadingAssistantMessage,
  clearErrorMessage,
  updateErrorMessage,
}: ChatFormContainerProps) {
  const [userInput, setUserInput] = useState<string>('');
  const [isStreamComplete, setIsStreamComplete] = useState<boolean>(true);

  const sendPromptToOllama = (messagesToSend: Message[]) => {
    clearErrorMessage();
    setIsLoadingAssistantMessage(true);
    setIsStreamComplete(false);

    window.electronApi.sendPrompt(messagesToSend);

    let firstChunkReceived = false;
    const messageId = uuidv4();

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: messageId, role: 'assistant', content: '' },
    ]);

    const handleStreamResponse = (chunk: string) => {
      if (!firstChunkReceived) {
        setIsLoadingAssistantMessage(false);
        firstChunkReceived = true;
      }

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId
            ? { ...message, content: message.content + chunk }
            : message,
        ),
      );
    };

    const unsubscribe =
      window.electronApi.onStreamResponse(handleStreamResponse);

    window.electronApi.onStreamError((errorMessage: string) => {
      setIsLoadingAssistantMessage(false);
      updateErrorMessage(errorMessage);
      setIsStreamComplete(true);

      unsubscribe();
    });

    window.electronApi.onStreamComplete(() => {
      setIsStreamComplete(true);

      unsubscribe();
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (userInput.trim()) {
      const newMessage = { id: uuidv4(), role: 'user', content: userInput };
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);

      sendPromptToOllama(newMessages);
      setUserInput('');
      setIsChatStarted(true);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <WelcomeTitle isChatStarted={isChatStarted} />
      <ChatForm
        isStreamComplete={isStreamComplete}
        userInput={userInput}
        isLoadingAssistantMessage={isLoadingAssistantMessage}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </div>
  );
}
