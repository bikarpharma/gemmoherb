import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrders() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "",
    paymentMethod: "",
    paymentStatus: "",
    discountAmount: "",
  });

  const { data: orders, refetch } = trpc.orders.allOrders.useQuery();
  const { data: orderDetails } = trpc.orders.getById.useQuery(
    { id: selectedOrderId! },
    { enabled: selectedOrderId !== null }
  );
  const { data: users } = trpc.users.list.useQuery();

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      refetch();
    },
  });

  const updatePaymentMutation = trpc.orders.updatePayment.useMutation({
    onSuccess: () => {
      toast.success("Paiement mis à jour");
      refetch();
      setIsEditDialogOpen(false);
    },
  });

  const applyDiscountMutation = trpc.orders.applyDiscount.useMutation({
    onSuccess: () => {
      toast.success("Remise appliquée");
      refetch();
      setIsEditDialogOpen(false);
    },
  });

  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Commande supprimée");
      refetch();
      setSelectedOrderId(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const markAsDeliveredMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Commande marquée comme livrée");
      refetch();
    },
  });

  const handleOpenEditDialog = (order: any) => {
    setEditFormData({
      status: order.status,
      paymentMethod: order.paymentMethod || "unpaid",
      paymentStatus: order.paymentStatus,
      discountAmount: order.discountAmount,
    });
    setSelectedOrderId(order.id);
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!selectedOrderId) return;

    // Mettre à jour le statut
    if (editFormData.status) {
      updateStatusMutation.mutate({
        id: selectedOrderId,
        status: editFormData.status as any,
      });
    }

    // Mettre à jour le paiement
    updatePaymentMutation.mutate({
      id: selectedOrderId,
      paymentMethod: editFormData.paymentMethod as any,
      paymentStatus: editFormData.paymentStatus as any,
    });

    // Appliquer la remise si modifiée
    const currentOrder = orders?.find((o) => o.id === selectedOrderId);
    if (currentOrder && editFormData.discountAmount !== currentOrder.discountAmount) {
      applyDiscountMutation.mutate({
        id: selectedOrderId,
        discountAmount: editFormData.discountAmount,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "secondary" },
      confirmed: { label: "Confirmée", variant: "default" },
      paid: { label: "Payée", variant: "default" },
      shipped: { label: "Expédiée", variant: "default" },
      delivered: { label: "Livrée", variant: "outline" },
      cancelled: { label: "Annulée", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Commandes</h1>
          <p className="text-muted-foreground mt-1">
            Validez et gérez toutes les commandes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toutes les commandes ({orders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => {
                  const user = users?.find(u => u.id === order.userId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p>{format(new Date(order.createdAt), "dd/MM/yyyy", { locale: fr })}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "HH:mm", { locale: fr })}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user?.pharmacyName || user?.name || "Client inconnu"}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                          {order.paymentStatus === "paid" ? "Payé" : "Non payé"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">{order.totalTTC} €</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrderId(order.id)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(order)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {order.status !== "delivered" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsDeliveredMutation.mutate({ id: order.id, status: "delivered" })}
                              title="Marquer comme livrée"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
                                deleteOrderMutation.mutate({ id: order.id });
                              }
                            }}
                            title="Supprimer"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de détails */}
      <Dialog open={selectedOrderId !== null && !isEditDialogOpen} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              {orderDetails?.order && format(new Date(orderDetails.order.createdAt), "PPP 'à' HH:mm", { locale: fr })}
            </DialogDescription>
          </DialogHeader>
          {orderDetails && (() => {
            const user = users?.find(u => u.id === orderDetails.order.userId);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Numéro de commande</p>
                    <p className="font-semibold">{orderDetails.order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                    <p>{getStatusBadge(orderDetails.order.status)}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-2">Informations pharmacie</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Nom:</span> {user?.pharmacyName || user?.name || "Non renseigné"}</p>
                    <p><span className="font-medium">Email:</span> {user?.email || "Non renseigné"}</p>
                    <p><span className="font-medium">Adresse:</span> {user?.pharmacyAddress || "Non renseignée"}</p>
                    <p><span className="font-medium">Téléphone:</span> {user?.pharmacyPhone || "Non renseigné"}</p>
                  </div>
                </div>

              <div>
                <h3 className="font-semibold mb-2">Articles commandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">Prix HT</TableHead>
                      <TableHead className="text-right">Total TTC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">{item.productReference}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.priceHT} €</TableCell>
                        <TableCell className="text-right font-medium">{item.totalTTC} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT:</span>
                  <span className="font-medium">{orderDetails.order.subtotalHT} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA (19%):</span>
                  <span className="font-medium">{orderDetails.order.tvaAmount} €</span>
                </div>
                {parseFloat(orderDetails.order.discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remise:</span>
                    <span className="font-medium text-green-600">-{orderDetails.order.discountAmount} €</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total TTC:</span>
                  <span className="text-primary">{orderDetails.order.totalTTC} €</span>
                </div>
              </div>
            </div>
          );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la commande</DialogTitle>
            <DialogDescription>
              Mettez à jour le statut, le paiement et appliquez une remise
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Statut de la commande</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmée</SelectItem>
                  <SelectItem value="paid">Payée</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <Select
                value={editFormData.paymentMethod}
                onValueChange={(value) => setEditFormData({ ...editFormData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="unpaid">Non payé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentStatus">Statut du paiement</Label>
              <Select
                value={editFormData.paymentStatus}
                onValueChange={(value) => setEditFormData({ ...editFormData, paymentStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="unpaid">Non payé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount">Remise (€)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={editFormData.discountAmount}
                onChange={(e) => setEditFormData({ ...editFormData, discountAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveChanges}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
