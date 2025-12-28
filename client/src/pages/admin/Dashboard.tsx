import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, ShoppingCart, Users, MessageSquare, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: orders } = trpc.orders.allOrders.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const { data: users } = trpc.users.list.useQuery();

  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalTTC), 0) || 0;
  const recentOrders = orders?.slice(0, 5) || [];

  const stats = [
    {
      title: "Produits",
      value: products?.length || 0,
      description: "Produits actifs",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Commandes",
      value: orders?.length || 0,
      description: `${pendingOrders} en attente`,
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Clients",
      value: users?.filter((u) => u.role === "user").length || 0,
      description: "Pharmacies inscrites",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Chiffre d'affaires",
      value: `${totalRevenue.toFixed(2)} DT`,
      description: "Total TTC",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de votre activité GemmoHerb
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>Les 5 dernières commandes reçues</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune commande pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{order.totalTTC} DT</p>
                        <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques produits</CardTitle>
              <CardDescription>Répartition du catalogue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Macérats de bourgeons</span>
                  </div>
                  <span className="text-sm font-medium">
                    {products?.filter((p) => p.category === "macerat").length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Huiles essentielles</span>
                  </div>
                  <span className="text-sm font-medium">
                    {products?.filter((p) => p.category === "huile_essentielle").length || 0}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm font-bold">{products?.length || 0} produits</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
