import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Package, PackageX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type ProductForm = {
  id?: number;
  reference: string;
  name: string;
  category: "macerat" | "huile_essentielle";
  unitVolume: string;
  priceHT: string;
};

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductForm | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    reference: "",
    name: "",
    category: "macerat",
    unitVolume: "",
    priceHT: "",
  });

  const { data: products, refetch } = trpc.products.list.useQuery();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produit créé avec succès");
      refetch();
      handleCloseDialog();
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produit modifié avec succès");
      refetch();
      handleCloseDialog();
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produit supprimé avec succès");
      refetch();
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });
  const toggleStockMutation = trpc.products.toggleStock.useMutation({
    onSuccess: (data) => {
      toast.success(data.inStock ? "Produit remis en stock" : "Produit marqué en rupture");
      refetch();
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id,
        reference: product.reference,
        name: product.name,
        category: product.category,
        unitVolume: product.unitVolume || "",
        priceHT: product.priceHT,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        reference: "",
        name: "",
        category: "macerat",
        unitVolume: "",
        priceHT: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.priceHT) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({
        id: formData.id!,
        reference: formData.reference,
        name: formData.name,
        category: formData.category,
        unitVolume: formData.unitVolume,
        priceHT: formData.priceHT,
      });
    } else {
      createMutation.mutate({
        reference: formData.reference,
        name: formData.name,
        category: formData.category,
        unitVolume: formData.unitVolume,
        priceHT: formData.priceHT,
        tvaRate: "19.00",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Produits</h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre catalogue de produits
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des produits ({filteredProducts?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-center">Disponibilité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => {
                  const priceTTC = (parseFloat(product.priceHT) * 1.19).toFixed(2);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.reference || "-"}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant={product.category === "macerat" ? "default" : "secondary"}>
                          {product.category === "macerat" ? "Macérat" : "Huile Essentielle"}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.unitVolume}</TableCell>
                      <TableCell className="text-right font-medium">{priceTTC} DT</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant={product.inStock ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => toggleStockMutation.mutate({ id: product.id })}
                          disabled={toggleStockMutation.isPending}
                          className="gap-1"
                        >
                          {product.inStock ? (
                            <>
                              <Package className="h-4 w-4" />
                              En stock
                            </>
                          ) : (
                            <>
                              <PackageX className="h-4 w-4" />
                              Rupture
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Modifiez les informations du produit" : "Ajoutez un nouveau produit au catalogue"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Ex: MAC001 (optionnel)"
              />
            </div>
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Airelle BIO - Vaccinium vitis-idaea"
                list="product-suggestions"
              />
              <datalist id="product-suggestions">
                {products?.map((product) => (
                  <option key={product.id} value={product.name} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "macerat" | "huile_essentielle") =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macerat">Macérat de bourgeon</SelectItem>
                  <SelectItem value="huile_essentielle">Huile essentielle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unitVolume">Volume/Unité</Label>
              <Input
                id="unitVolume"
                value={formData.unitVolume}
                onChange={(e) => setFormData({ ...formData, unitVolume: e.target.value })}
                placeholder="Ex: 10 ML, Flacon"
              />
            </div>
            <div>
              <Label htmlFor="priceHT">Prix HT (DT) *</Label>
              <Input
                id="priceHT"
                type="number"
                step="0.01"
                value={formData.priceHT}
                onChange={(e) => setFormData({ ...formData, priceHT: e.target.value })}
                placeholder="Ex: 37.70"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              TVA: 19% • Prix TTC: {formData.priceHT ? (parseFloat(formData.priceHT) * 1.19).toFixed(2) : "0.00"} DT
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
