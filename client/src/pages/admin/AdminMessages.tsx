import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, MessageSquare, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminMessages() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: users } = trpc.users.list.useQuery();
  const { data: messages, refetch } = trpc.messages.getConversation.useQuery(
    { otherUserId: selectedUserId! },
    { enabled: selectedUserId !== null, refetchInterval: 5000 }
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
    if (messages && messages.length > 0 && selectedUserId) {
      markAsReadMutation.mutate({ senderId: selectedUserId });
    }
  }, [messages, selectedUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageContent.trim() || !selectedUserId) return;
    sendMessageMutation.mutate({
      recipientId: selectedUserId,
      content: messageContent,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const pharmacies = users?.filter((u) => u.role === "user") || [];
  const selectedUser = users?.find((u) => u.id === selectedUserId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Communiquez avec vos clients pharmacies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-16rem)]">
          {/* Liste des conversations */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-22rem)]">
                {pharmacies.length === 0 ? (
                  <div className="text-center py-8 px-4 text-muted-foreground text-sm">
                    Aucune pharmacie inscrite
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {pharmacies.map((pharmacy) => (
                      <button
                        key={pharmacy.id}
                        onClick={() => setSelectedUserId(pharmacy.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-colors",
                          selectedUserId === pharmacy.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{pharmacy.name || "Sans nom"}</p>
                            <p className="text-xs truncate opacity-70">
                              {pharmacy.pharmacyName || pharmacy.email || "ID: " + pharmacy.id}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Zone de conversation */}
          <Card className="md:col-span-2">
            {selectedUserId === null ? (
              <CardContent className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Sélectionnez une conversation pour commencer
                </p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedUser?.name || "Utilisateur"}
                  </CardTitle>
                  {selectedUser?.pharmacyName && (
                    <p className="text-sm text-muted-foreground">{selectedUser.pharmacyName}</p>
                  )}
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages && messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Aucun message dans cette conversation</p>
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
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
