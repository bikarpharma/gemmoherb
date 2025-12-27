import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Messages() {
  const { user } = useAuth();
  const [messageContent, setMessageContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Pour les pharmacies, l'admin est toujours le destinataire (on suppose que l'admin a l'ID 1)
  const adminId = 1;
  const otherUserId = user?.role === "admin" ? 0 : adminId; // 0 sera géré côté admin
  
  const { data: messages, refetch } = trpc.messages.getConversation.useQuery(
    { otherUserId },
    { enabled: user?.role !== "admin", refetchInterval: 5000 }
  );
  
  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      refetch();
      toast.success("Message envoyé");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsReadMutation.mutate({ senderId: adminId });
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate({
      recipientId: adminId,
      content: messageContent,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Communiquez avec GemmoHerb pour toute question
          </p>
        </div>

        <Card className="h-[calc(100vh-16rem)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation avec GemmoHerb
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages && messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun message pour le moment</p>
                    <p className="text-sm mt-2">Commencez la conversation en envoyant un message</p>
                  </div>
                ) : (
                  messages?.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-4 py-2",
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {format(new Date(message.createdAt), "HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
