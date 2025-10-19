import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Heart, Trash2, History, Plus, Menu, Paperclip, Image, FileText, X, Mic, MicOff, Play, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authenticatedFetch } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  audioUrl?: string; // Add audio URL for voice messages
}

interface Attachment {
  id: string;
  name: string;
  type: string; // 'image' | 'document' | 'audio'
  url: string;
  size: number;
}

interface ChatResponse {
  message: string;
  action?: "show_meal_plan" | "show_exercise_plan" | "show_risk_explanation" | "show_emergency" | "show_medication_reminder" | "show_clinical_data" | "show_latest_prediction" | "show_trend_analysis" | "show_tele_consult" | "show_forum" | "show_goals" | "show_daily_tip" | "show_micro_lessons" | "show_personalized_tips";
  suggestions?: string[];
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
}

export default function ChatInterface({ initialMessages = [] }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp || new Date()
  })));
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<{id: string, title: string, timestamp: Date}[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation history on component mount
  useEffect(() => {
    loadConversationHistory();
    loadConversations();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await authenticatedFetch("/api/chatbot/conversations");
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations?.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp)
        })) || []);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const response = await authenticatedFetch("/api/chatbot/history");
      
      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          setMessages(data.history.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } else if (response.status === 401) {
        // Handle authentication error
        toast({
          title: "Authentication Required",
          description: "Please log in to access the chat history.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearConversationHistory = async () => {
    try {
      const response = await authenticatedFetch("/api/chatbot/history", {
        method: "DELETE"
      });
      
      if (response.ok) {
        setMessages([]);
        toast({
          title: "Success",
          description: "Conversation history cleared"
        });
      } else if (response.status === 401) {
        // Handle authentication error
        toast({
          title: "Authentication Required",
          description: "Please log in to clear chat history.",
          variant: "destructive",
        });
      } else {
        throw new Error("Failed to clear conversation history");
      }
    } catch (error) {
      console.error("Error clearing conversation history:", error);
      toast({
        title: "Error",
        description: "Failed to clear conversation history",
        variant: "destructive"
      });
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setAttachments([]);
    setCurrentConversationId(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    // Upload attachments to the server first
    const uploadedAttachments: Attachment[] = [];
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        try {
          // For file URLs that are already object URLs, we need to upload them
          if (attachment.url.startsWith('blob:')) {
            // In a real implementation, we would upload the file to the server
            // For now, we'll just pass the attachment as is
            uploadedAttachments.push(attachment);
          } else {
            uploadedAttachments.push(attachment);
          }
        } catch (error) {
          console.error("Error uploading attachment:", error);
          toast({
            title: "Error",
            description: `Failed to upload file: ${attachment.name}`,
            variant: "destructive"
          });
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      attachments: [...uploadedAttachments]
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);
    // Stop any playing audio when sending a new message
    if (currentAudio) {
      stopAudio();
    }

    try {
      // Send message to the chatbot API
      const response = await authenticatedFetch("/api/chatbot/message", {
        method: "POST",
        body: JSON.stringify({ 
          message: input,
          attachments: uploadedAttachments.map(att => ({
            id: att.id,
            name: att.name,
            type: att.type,
            url: att.url,
            size: att.size
          }))
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle authentication error
          toast({
            title: "Authentication Required",
            description: "Please log in to use the chat.",
            variant: "destructive",
          });
          
          // Add error message to chat
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Please log in to use the chat assistant.",
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, errorMessage]);
          return;
        }
        throw new Error("Failed to get response from chatbot");
      }
      
      const data: ChatResponse = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Handle actions from the chatbot
      if (data.action) {
        // In a real implementation, we would dispatch events or update context
        // to show the appropriate UI components
        console.log("Chatbot action requested:", data.action);
      }
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      
      // Show error message to user
      toast({
        title: "Error",
        description: "Failed to get response from chatbot. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to a readable format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload only images (PNG, JPG) or PDF documents",
          variant: "destructive"
        });
        continue;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 5MB",
          variant: "destructive"
        });
        continue;
      }
      
      // Create attachment object
      const attachment: Attachment = {
        id: Date.now().toString() + i,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: URL.createObjectURL(file),
        size: file.size
      };
      
      newAttachments.push(attachment);
    }
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Initialize media recorder for voice messages
  const initMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create attachment for the voice message
        const attachment: Attachment = {
          id: Date.now().toString(),
          name: `voice-message-${new Date().getTime()}.webm`,
          type: 'audio',
          url: audioUrl,
          size: audioBlob.size
        };
        
        setAttachments(prev => [...prev, attachment]);
        setAudioChunks([]);
      };
      
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record voice messages.",
        variant: "destructive",
      });
    }
  };

  // Start recording voice message
  const startRecording = async () => {
    if (!mediaRecorder) {
      await initMediaRecorder();
      return;
    }
    
    if (mediaRecorder.state === 'inactive') {
      setAudioChunks([]);
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Stop recording voice message
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all media tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Play audio message
  const playAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
    
    const audio = new Audio(audioUrl);
    audio.play();
    setIsPlaying(true);
    setCurrentAudio(audio);
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
  };

  // Stop playing audio
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  // Start editing a message
  const startEditing = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  // Save edited message
  const saveEdit = (messageId: string) => {
    if (!editContent.trim()) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: editContent } 
        : msg
    ));
    
    setEditingMessageId(null);
    setEditContent("");
  };

  // Delete a message
  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Copy message content to clipboard
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied to your clipboard"
      });
    } catch (error) {
      console.error("Failed to copy message:", error);
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive"
      });
    }
  };

  // Add useEffect to initialize media recorder
  useEffect(() => {
    initMediaRecorder();
    
    return () => {
      // Cleanup on unmount
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[400px] border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className={`${showHistory ? 'w-64' : 'w-0'} transition-all duration-300 bg-muted border-r flex flex-col`}>
        <div className="p-4 border-b">
          <Button 
            onClick={startNewConversation} 
            className="w-full"
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className="p-3 rounded-md hover:bg-accent cursor-pointer mb-1 text-sm"
                onClick={() => {
                  // In a real implementation, we would load this conversation
                  console.log("Load conversation", conversation.id);
                }}
              >
                <div className="font-medium truncate">{conversation.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(conversation.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-semibold">Health Assistant</h2>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={clearConversationHistory}
            title="Clear history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground">
                  Ask me about your risk factors, lifestyle changes, or health guidance
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 group ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      {editingMessageId !== message.id && (
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyMessage(message.content)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => startEditing(message.id, message.content)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col max-w-[85%]">
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="relative">
                            {attachment.type === 'image' ? (
                              <div className="w-24 h-24 rounded-md overflow-hidden border">
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : attachment.type === 'audio' ? (
                              <div className="w-48 h-16 rounded-md bg-muted border flex items-center justify-between p-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    if (isPlaying && currentAudio && currentAudio.src === attachment.url) {
                                      stopAudio();
                                    } else {
                                      playAudio(attachment.url);
                                    }
                                  }}
                                >
                                  {isPlaying && currentAudio && currentAudio.src === attachment.url ? (
                                    <Square className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <span className="text-xs truncate flex-1 px-2">
                                  {attachment.name}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeAttachment(attachment.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-24 h-24 rounded-md bg-muted border flex flex-col items-center justify-center p-2">
                                <FileText className="h-6 w-6 text-muted-foreground mb-1" />
                                <span className="text-xs text-center truncate w-full">
                                  {attachment.name}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                      }`}
                    >
                      {editingMessageId === message.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-background text-foreground p-2 rounded border"
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => saveEdit(message.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                          <div className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      {editingMessageId !== message.id && (
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyMessage(message.content)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => startEditing(message.id, message.content)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* File upload area */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="relative group">
                    {attachment.type === 'image' ? (
                      <div className="w-16 h-16 rounded-md overflow-hidden border relative">
                        <img 
                          src={attachment.url} 
                          alt={attachment.name} 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted border flex flex-col items-center justify-center p-1 relative">
                        <FileText className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-xs text-center truncate w-full">
                          {attachment.name.split('.').pop()}
                        </span>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t">
          <div 
            className={`
              border rounded-lg p-2 transition-all duration-200
              ${isDragging ? 'border-dashed border-primary bg-primary/5' : 'border-border'}
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* File input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                aria-label="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              {/* Voice recording button */}
              <Button
                type="button"
                variant={isRecording ? "destructive" : "ghost"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="ml-1 text-xs">REC</span>
                  </div>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="border-0 focus-visible:ring-0 shadow-none"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  ref={inputRef}
                />
              </div>
              
              <Button
                type="button"
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                size="icon"
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-lg border-2 border-dashed border-primary">
                <div className="text-center">
                  <Paperclip className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-primary font-medium">Drop files here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
