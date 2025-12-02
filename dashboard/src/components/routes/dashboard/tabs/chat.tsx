'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Trash2, StopCircle, Send } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card } from '@/src/components/ui/card';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useAuth } from '@/src/hooks/useAuth';
import Loading from '@/src/components/layouts/Loading';

export default function ChatBot() {
    const { messages, sendMessage, setMessages, status, stop, error, regenerate } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { status: statusAuth, user } = useAuth();

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    if (statusAuth === "unauthenticated") {
        return (
            <div>
                <span>Você precisa estar logado.</span>
            </div>
        );
    }

    if (statusAuth === "loading") {
        return <Loading />
    }


    const handleDelete = (id: string) => {
        setMessages(messages.filter(message => message.id !== id));
    };

    return (
        <div className="flex pt-20 flex-col m-auto h-screen bg-background text-foreground">
            <ScrollArea className="flex-1 p-4 py-9 overflow-auto">
                <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            Start a conversation with the AI
                        </div>
                    )}

                    {messages.map(message => (
                        <div key={message.id} className="flex gap-3">
                            <Avatar className="mt-1">
                                <AvatarImage src={message.role === 'user' ? user?.image : '/ai-avatar.png' as any} />
                                <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <Card className={`p-4 rounded-sm shadow-none ${message.role === 'user' ? '' : 'bg-secondary/10 border-secondary'}`}>
                                    {/* <div className="text-sm text-border ">
                                        {message.role === 'user' ? user?.name : 'AI Assistant'}
                                    </div> */}
                                    <div className="whitespace-pre-wrap">
                                        {message.parts.map((part, index) =>
                                            part.type === 'text' ? (
                                                <span key={index}>{part.text}</span>
                                            ) : null
                                        )}
                                    </div>
                                </Card>

                                {
                                    message.role === 'assistant' && (
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => regenerate(message.id as any)}
                                                disabled={!(status === 'ready' || status === 'error')}
                                                className="h-8 w-8 p-0"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(message.id)}
                                                disabled={status !== 'ready'}
                                                className="h-8 w-8 p-0  "
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {error && (
                <div className='px-4'>
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            An error occurred during the conversation.
                        </AlertDescription>
                        <Button variant="outline" size="icon" className='mt-2'>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </Alert>
                </div>
            )}

            {(status === 'submitted' || status === 'streaming') && (
                <div className="bg-secondary/50 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <span className="text-sm">AI is thinking...</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={stop}>
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop
                    </Button>
                </div>
            )}

            <div className="p-4 border-t">
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (input.trim()) {
                            sendMessage({ text: input });
                            setInput('');
                        }
                    }}
                    className="flex gap-2 max-w-4xl mx-auto"
                >
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={status !== 'ready'}
                        placeholder="Type your message..."
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={status !== 'ready' || !input.trim()}
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}