import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Plus, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ productId: number; quantity: number; name: string; priceHT: string; reference: string | null }[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const { data: products, isLoading } = trpc.products.list.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Commande créée avec succès !");
      setCart([]);
      setQuantities({});
      setLocation("/orders");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la commande: " + error.message);
    },
  });

  // Rediriger les admins vers leur dashboard
  useEffect(() => {
    if (user?.role === "admin") {
      setLocation("/admin");
    }
  }, [user?.role, setLocation]);

  if (user?.role === "admin") {
    return null;
  }

  const getQuantity = (productId: number) => {
    return quantities[productId] || 1;
  };

  const setQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const addToCart = (productId: number, name: string, priceHT: string, reference: string | null) => {
    const quantity = getQuantity(productId);
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { productId, quantity, name, priceHT, reference }];
    });
    toast.success(`${quantity} × ${name} ajouté au panier`);
    setQuantities((prev) => ({ ...prev, [productId]: 1 }));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Produit retiré du panier");
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const calculateTotal = () => {
    const subtotalHT = cart.reduce((sum, item) => {
      return sum + parseFloat(item.priceHT) * item.quantity;
    }, 0);
    const tvaAmount = subtotalHT * 0.19;
    const totalTTC = subtotalHT + tvaAmount;
    return { subtotalHT, tvaAmount, totalTTC };
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    createOrderMutation.mutate({
      items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.reference && product.reference.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const macerats = filteredProducts?.filter((p) => p.category === "macerat");
  const huilesEssentielles = filteredProducts?.filter((p) => p.category === "huile_essentielle");

  const totals = calculateTotal();

  // Mapping des noms de produits vers les icônes SVG
  const iconMapping: Record<string, string> = {
    // Correspondances directes
    "airelle": "airelle",
    "amandier": "amandier",
    "argousier": "argousier",
    "aubepine": "aubepine",
    "bruyere": "bruyere",
    "charme": "charme",
    "figuier": "figuier",
    "framboisier": "framboisier",
    "ginkgo": "ginkgo",
    "marronnier": "marronnier",
    "noisetier": "noisetier",
    "noyer": "noyer",
    "olivier": "olivier",
    "orme": "orme",
    "platane": "platane",
    "pommier": "pommier",
    "romarin": "romarin",
    "ronce": "ronce",
    "sorbier": "sorbier",
    "tamaris": "tamaris",
    "tilleul": "tilleul",
    "vigne": "vigne",
    "viorne": "viorne",
    "myrtillier": "myrtillier",
    "frene": "frene",

    // Correspondances avec variations
    "cassissier": "cassis",
    "aulne": "aulne",
    "bouleau": "bouleau",
    "cedre": "cedre",
    "chataignier": "chataignier",
    "chene": "chene",
    "cornouiller": "cornouiller",
    "eglantier": "eglantier",
    "erable": "erable",
    "genevrier": "genevrier",
    "hetre": "hetre",
    "mais": "mais",
    "peuplier": "peuplier",
    "pin": "pin",
    "sapin": "sapin",
    "saule": "saule",
    "sequoia": "sequoia",

    // Noms alternatifs
    "gui": "macerat-generic",
    "bouillon": "macerat-generic",
    "meleze": "macerat-generic",
    "murier": "macerat-generic",
    "sureau": "macerat-generic",
  };

  const getIconPath = (product: { name: string; category: string }) => {
    if (product.category === "huile_essentielle") {
      return "/bourgeons/huile-generic.svg";
    }

    // Normaliser le nom du produit (minuscules, sans accents)
    const productName = product.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const firstWord = productName.split(" ")[0];

    // Chercher dans le mapping
    if (iconMapping[firstWord]) {
      return `/bourgeons/${iconMapping[firstWord]}.svg`;
    }

    return "/bourgeons/macerat-generic.svg";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Catalogue Produits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Commandez vos macérats de bourgeons et huiles essentielles
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Catalogue */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="macerats" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="macerats">
                  Macérats de Bourgeons ({macerats?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="huiles">
                  Huiles Essentielles ({huilesEssentielles?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="macerats" className="mt-4">
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Chargement...</div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead className="w-[70px]">Réf.</TableHead>
                          <TableHead>Produit</TableHead>
                          <TableHead className="w-[100px]">Volume</TableHead>
                          <TableHead className="w-[100px] text-right">Prix</TableHead>
                          <TableHead className="w-[100px] text-center">Statut</TableHead>
                          <TableHead className="w-[120px]">Quantité</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {macerats?.map((product) => {
                          const quantity = getQuantity(product.id);
                          const priceTTC = (parseFloat(product.priceHT) * 1.19).toFixed(2);
                          const isOutOfStock = !product.inStock;
                          return (
                            <TableRow key={product.id} className={isOutOfStock ? "opacity-60" : ""}>
                              <TableCell className="w-[40px]">
                                <img
                                  src={getIconPath(product)}
                                  alt={product.name}
                                  className="h-10 w-10 object-contain mix-blend-multiply"
                                  onError={(e) => {
                                    e.currentTarget.src = "/bourgeons/macerat-generic.svg";
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {product.reference || "-"}
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {product.unitVolume}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {priceTTC} DT
                              </TableCell>
                              <TableCell className="text-center">
                                {isOutOfStock ? (
                                  <Badge variant="destructive">Non disponible</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-600">En stock</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 1)}
                                  className="w-16 h-8 text-center"
                                  disabled={isOutOfStock}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => addToCart(product.id, product.name, product.priceHT, product.reference)}
                                  size="sm"
                                  variant="default"
                                  disabled={isOutOfStock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="huiles" className="mt-4">
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Chargement...</div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead className="w-[70px]">Réf.</TableHead>
                          <TableHead>Produit</TableHead>
                          <TableHead className="w-[100px]">Volume</TableHead>
                          <TableHead className="w-[100px] text-right">Prix</TableHead>
                          <TableHead className="w-[100px] text-center">Statut</TableHead>
                          <TableHead className="w-[120px]">Quantité</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {huilesEssentielles?.map((product) => {
                          const quantity = getQuantity(product.id);
                          const priceTTC = (parseFloat(product.priceHT) * 1.19).toFixed(2);
                          const isOutOfStock = !product.inStock;
                          return (
                            <TableRow key={product.id} className={isOutOfStock ? "opacity-60" : ""}>
                              <TableCell className="w-[40px]">
                                <img
                                  src={getIconPath(product)}
                                  alt={product.name}
                                  className="h-10 w-10 object-contain mix-blend-multiply"
                                  onError={(e) => {
                                    e.currentTarget.src = "/bourgeons/huile-generic.svg";
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {product.reference || "-"}
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {product.unitVolume}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {priceTTC} DT
                              </TableCell>
                              <TableCell className="text-center">
                                {isOutOfStock ? (
                                  <Badge variant="destructive">Non disponible</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-600">En stock</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 1)}
                                  className="w-16 h-8 text-center"
                                  disabled={isOutOfStock}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => addToCart(product.id, product.name, product.priceHT, product.reference)}
                                  size="sm"
                                  variant="default"
                                  disabled={isOutOfStock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Panier */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)} articles)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Votre panier est vide
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {cart.map((item) => {
                        const itemPriceTTC = parseFloat(item.priceHT) * 1.19;
                        const itemTotalTTC = itemPriceTTC * item.quantity;
                        return (
                          <div key={item.productId} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {itemPriceTTC.toFixed(2)} DT × {item.quantity} = {itemTotalTTC.toFixed(2)} DT
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs w-6 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-base font-bold">
                        <span>Total:</span>
                        <span className="text-primary">{totals.totalTTC.toFixed(2)} DT</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Création..." : "Valider la commande"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
