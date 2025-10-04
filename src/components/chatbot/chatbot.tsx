'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getChatbotResponse } from './actions';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await getChatbotResponse(input);
            if (result.success && result.response) {
                const assistantMessage: Message = { role: 'assistant', content: result.response };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                const errorMessage: Message = { role: 'assistant', content: result.error || "Sorry, something went wrong." };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage: Message = { role: 'assistant', content: "An unexpected error occurred." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={toggleChat}
                    size="icon"
                    className="rounded-full w-14 h-14 bg-primary shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
                </Button>
            </div>
            
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50">
                    <Card className="w-80 shadow-2xl animate-fade-in-up">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="text-primary" />
                                Expense Manager Assistant
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-80 pr-4" ref={scrollAreaRef}>
                                <div className="space-y-4">
                                    <MessageBubble role="assistant" content="Hello! How can I help you with your workflows today?" />
                                    {messages.map((msg, index) => (
                                        <MessageBubble key={index} {...msg} />
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex w-full items-center space-x-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your tasks..."
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" disabled={isLoading}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    );
}

function MessageBubble({ role, content }: Message) {
    const isUser = role === 'user';
    return (
        <div className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                </Avatar>
            )}
            <div
                className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
            >
                {content}
            </div>
        </div>
    );
}
