import ChatInterface from "../ChatInterface";

export default function ChatInterfaceExample() {
  const initialMessages = [
    {
      id: "1",
      role: "assistant" as const,
      content: "Hello! I'm your health assistant. I can help explain your risk assessment, suggest lifestyle changes, or answer general health questions. How can I help you today?"
    },
    {
      id: "2",
      role: "user" as const,
      content: "What does my high blood pressure mean for my risk?"
    },
    {
      id: "3",
      role: "assistant" as const,
      content: "High blood pressure is a significant contributor to heart disease risk. It puts extra strain on your arteries and heart. I'd recommend reducing salt intake to less than 2g per day, staying physically active, and discussing medication options with your doctor. Would you like some low-sodium meal suggestions?"
    }
  ];

  return <ChatInterface initialMessages={initialMessages} />;
}
