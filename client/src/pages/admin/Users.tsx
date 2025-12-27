import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { Plus, Check, X, Trash2, Clock, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    pharmacyName: "",
    pharmacyAddress: "",
    pharmacyPhone: "",
  });

  const { data: users, refetch, isLoading } = trpc.users.list.useQuery();

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Pharmacie créée avec succès");
      refetch();
      setIsCreateDialogOpen(false);
      setFormData({ username: "", password: "", email: "", pharmacyName: "", pharmacyAddress: "", pharmacyPhone: "" });
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });

  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: () => {
      toast.success("Pharmacie approuvée");
      refetch();
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });

  const rejectMutation = trpc.users.reject.useMutation({
    onSuccess: () => {
      toast.success("Demande rejetée");
      refetch();
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur supprimé");
      refetch();
    },
    onError: (error) => toast.error("Erreur: " + error.message),
  });

  const handleCreate = () => {
    if (!formData.username || !formData.password || !formData.email || !formData.pharmacyName) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createMutation.mutate({
      ...formData,
      role: "user",
      status: "approved",
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const pendingUsers = users?.filter((u) => u.status === "pending") || [];
  const approvedPharmacies = users?.filter((u) => u.role === "user" && u.status === "approved") || [];
  const rejectedUsers = users?.filter((u) => u.status === "rejected") || [];
  const admins = users?.filter((u) => u.role === "admin") || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case "approved":
        return <Badge variant="default" className="gap-1 bg-green-600"><UserCheck className="h-3 w-3" /> Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><UserX className="h-3 w-3" /> Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les pharmacies et validez les inscriptions
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une pharmacie
          </Button>
        </div>

        {/* Demandes en attente */}
        {pendingUsers.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Demandes en attente ({pendingUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pharmacie</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.pharmacyName || user.name || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.pharmacyPhone || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{user.pharmacyAddress || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate({ id: user.id })}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate({ id: user.id })}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pharmacies approuvées */}
        <Card>
          <CardHeader>
            <CardTitle>Pharmacies ({approvedPharmacies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : approvedPharmacies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune pharmacie inscrite</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pharmacie</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedPharmacies.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.pharmacyName || user.name || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.pharmacyPhone || "-"}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.lastSignedIn), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id, user.pharmacyName || user.name || "cet utilisateur")}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Demandes rejetées */}
        {rejectedUsers.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Demandes rejetées ({rejectedUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pharmacie</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.pharmacyName || user.name || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveMutation.mutate({ id: user.id })}
                          >
                            Réactiver
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id, user.pharmacyName || user.name || "cet utilisateur")}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Administrateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Administrateurs ({admins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun administrateur</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || user.username}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="default">Admin</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.lastSignedIn), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog création pharmacie */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une pharmacie</DialogTitle>
            <DialogDescription>
              Créez un compte pour une nouvelle pharmacie
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pharmacyName">Nom de la pharmacie *</Label>
              <Input
                id="pharmacyName"
                value={formData.pharmacyName}
                onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                placeholder="Pharmacie du Centre"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@pharmacie.com"
              />
            </div>
            <div>
              <Label htmlFor="pharmacyPhone">Téléphone</Label>
              <Input
                id="pharmacyPhone"
                value={formData.pharmacyPhone}
                onChange={(e) => setFormData({ ...formData, pharmacyPhone: e.target.value })}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div>
              <Label htmlFor="pharmacyAddress">Adresse</Label>
              <Input
                id="pharmacyAddress"
                value={formData.pharmacyAddress}
                onChange={(e) => setFormData({ ...formData, pharmacyAddress: e.target.value })}
                placeholder="123 Rue Exemple, Ville"
              />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-4">Identifiants de connexion</p>
            </div>
            <div>
              <Label htmlFor="username">Nom d'utilisateur *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="pharmacie_centre"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 caractères"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
