import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@shared/types';
import ChatForm from './ChatForm';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';
import WelcomeTitle from './WelcomeTitle';

interface ChatFormContainerProps {
  isChatStarted: boolean;
  setIsChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatFormContainer({
  isChatStarted,
  setIsChatStarted,
  messages,
  setMessages,
}: ChatFormContainerProps) {
  const [userInput, setUserInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreamComplete, setIsStreamComplete] = useState<boolean>(true);

  const sendPromptToOllama = (messagesToSend: Message[]) => {
    setErrorMessage('');
    setIsLoading(true);
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
        setIsLoading(false);
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

    window.electronApi.onStreamError((error: string) => {
      setIsLoading(false);
      setErrorMessage(error);
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
    <div className="mx-auto w-full max-w-2xl">
      {errorMessage && (
        <ErrorAlert errorMessage={errorMessage} className="self-start" />
      )}
      <WelcomeTitle isChatStarted={isChatStarted} />
      <LoadingSpinner isLoading={isLoading} />
      <ChatForm
        isStreamComplete={isStreamComplete}
        userInput={userInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </div>
  );
}
