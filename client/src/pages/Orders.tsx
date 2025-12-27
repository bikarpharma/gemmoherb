import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Package } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Orders() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery();
  const { data: orderDetails } = trpc.orders.getById.useQuery(
    { id: selectedOrderId! },
    { enabled: selectedOrderId !== null }
  );

  // Debug: log orderDetails when it changes
  if (orderDetails) {
    console.log("📦 Order Details:", orderDetails);
    console.log("📦 Items count:", orderDetails.items?.length);
    console.log("📦 Items:", orderDetails.items);
  }

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

  const getPaymentStatusBadge = (status: string) => {
    return status === "paid" ? (
      <Badge variant="default">Payé</Badge>
    ) : (
      <Badge variant="secondary">Non payé</Badge>
    );
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const labels: Record<string, string> = {
      cash: "Espèces",
      check: "Chèque",
      unpaid: "Non payé",
    };
    return method ? labels[method] || method : "Non spécifié";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes Commandes</h1>
          <p className="text-muted-foreground mt-1">
            Consultez l'historique de vos commandes et leur statut
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : orders && orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune commande pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders?.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Commande {order.orderNumber}</CardTitle>
                      <CardDescription>
                        {format(new Date(order.createdAt), "PPP 'à' HH:mm", { locale: fr })}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {parseFloat(order.discountAmount) > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Remise</p>
                        <p className="font-medium text-green-600">-{order.discountAmount} DT</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-primary">{order.totalTTC} DT</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mode de paiement</p>
                      <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={selectedOrderId !== null} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              {orderDetails?.order && format(new Date(orderDetails.order.createdAt), "PPP 'à' HH:mm", { locale: fr })}
            </DialogDescription>
          </DialogHeader>
          {orderDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Numéro de commande</p>
                  <p className="font-semibold">{orderDetails.order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  {getStatusBadge(orderDetails.order.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paiement</p>
                  {getPaymentStatusBadge(orderDetails.order.paymentStatus)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mode de paiement</p>
                  <p>{getPaymentMethodLabel(orderDetails.order.paymentMethod)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Articles commandés ({orderDetails.items?.length || 0} articles)</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.items && orderDetails.items.length > 0 ? (
                      orderDetails.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">{item.productReference}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.totalTTC} DT</TableCell>
                          <TableCell className="text-right font-medium">{item.totalTTC} DT</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Aucun article trouvé pour cette commande
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                {parseFloat(orderDetails.order.discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remise:</span>
                    <span className="font-medium text-green-600">-{orderDetails.order.discountAmount} DT</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{orderDetails.order.totalTTC} DT</span>
                </div>
              </div>

              {orderDetails.order.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{orderDetails.order.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
