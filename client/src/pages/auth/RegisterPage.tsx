import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        pharmacyName: "",
        pharmacyAddress: "",
        pharmacyPhone: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [, setLocation] = useLocation();

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: () => {
            setSuccess(true);
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        registerMutation.mutate({
            username: formData.username,
            password: formData.password,
            email: formData.email,
            pharmacyName: formData.pharmacyName,
            pharmacyAddress: formData.pharmacyAddress,
            pharmacyPhone: formData.pharmacyPhone,
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <h2 className="text-xl font-semibold">Demande envoyée !</h2>
                            <p className="text-muted-foreground">
                                Votre demande d'inscription a été envoyée avec succès.
                                L'administrateur examinera votre demande et vous pourrez
                                vous connecter une fois votre compte approuvé.
                            </p>
                            <Button onClick={() => setLocation("/login")} className="mt-4">
                                Retour à la connexion
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Inscription Pharmacie</CardTitle>
                    <CardDescription className="text-center">
                        Créez votre compte pour commander vos produits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pharmacyName">Nom de la pharmacie *</Label>
                            <Input
                                id="pharmacyName"
                                type="text"
                                placeholder="Pharmacie du Centre"
                                value={formData.pharmacyName}
                                onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@pharmacie.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pharmacyPhone">Téléphone</Label>
                            <Input
                                id="pharmacyPhone"
                                type="tel"
                                placeholder="+216 XX XXX XXX"
                                value={formData.pharmacyPhone}
                                onChange={(e) => setFormData({ ...formData, pharmacyPhone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pharmacyAddress">Adresse</Label>
                            <Input
                                id="pharmacyAddress"
                                type="text"
                                placeholder="123 Rue Exemple, Ville"
                                value={formData.pharmacyAddress}
                                onChange={(e) => setFormData({ ...formData, pharmacyAddress: e.target.value })}
                            />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <p className="text-sm text-muted-foreground mb-4">Informations de connexion</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Nom d'utilisateur *</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="pharmacie_centre"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                minLength={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Minimum 6 caractères"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                            {registerMutation.isPending ? "Envoi en cours..." : "Créer mon compte"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Vous avez déjà un compte ?{" "}
                        <a href="/login" className="text-primary hover:underline font-medium">
                            Se connecter
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
