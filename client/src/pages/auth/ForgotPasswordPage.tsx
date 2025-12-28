import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
        onSuccess: () => {
            setSuccess(true);
            setError("");
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        forgotPasswordMutation.mutate({ email });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">Email envoyé !</CardTitle>
                        <CardDescription className="text-center">
                            Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href="/login">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour à la connexion
                            </Button>
                        </a>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Mail className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Mot de passe oublié</CardTitle>
                    <CardDescription className="text-center">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Adresse email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                            {forgotPasswordMutation.isPending ? "Envoi en cours..." : "Envoyer le lien"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <a href="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline inline-flex items-center">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Retour à la connexion
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
