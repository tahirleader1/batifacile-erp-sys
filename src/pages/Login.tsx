import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setSuccess(true);
      if (rememberMe) {
        localStorage.setItem('batifacile-last-email', email);
      } else {
        localStorage.removeItem('batifacile-last-email');
      }
      navigate('/', { replace: true });
    }

    setSubmitting(false);
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('batifacile-last-email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0c1e33] via-[#0e2d4b] to-[#07223c] text-white relative overflow-hidden"
      style={{ fontFamily: '"Manrope", "Inter", system-ui, sans-serif' }}
    >
      <div className="absolute inset-0">
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-green-400/10 blur-3xl" />
        <div className="absolute right-0 -bottom-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-10 rounded-3xl border border-white/5" />
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between px-12 py-14 bg-white/5 backdrop-blur-lg border-r border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/batifacile-logo.png"
              alt="Batifacile"
              className="h-14 w-auto"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-green-200">Construire - Bâtir - Durer</p>
              <h1 className="text-3xl font-semibold mt-1 text-white">Plateforme Batifacile</h1>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
              <p className="text-lg font-semibold text-white">Simplifiez la gestion de vos chantiers</p>
              <p className="text-sm text-blue-100 mt-2">
                Connectez-vous pour accéder aux stocks en temps réel, au suivi des partenaires et aux rapports de votre quincaillerie.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {[
                  'Inventaire et ventes synchronisés',
                  'Accès sécurisé et journalisé',
                  'Données en temps réel pour votre équipe',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-blue-100">
                    <CheckCircle2 className="h-5 w-5 text-green-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-blue-100 uppercase tracking-[0.14em]">Disponibilité</p>
                <p className="text-2xl font-semibold text-white mt-1">99.9%</p>
                <p className="text-xs text-blue-100 mt-1">Temps de service</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-blue-100 uppercase tracking-[0.14em]">Support</p>
                <p className="text-2xl font-semibold text-white mt-1">24/7</p>
                <p className="text-xs text-blue-100 mt-1">Assistance prioritaire</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
          <div className="w-full max-w-xl bg-white/95 text-gray-900 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#0a7c57]/10 blur-2xl" />
            <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-[#0f3d6d]/15 blur-2xl" />

            <div className="relative p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#0f3d6d] to-[#0a7c57] rounded-2xl p-3 shadow-lg">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500">Bienvenue</p>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Connexion sécurisée</h2>
                  </div>
                </div>
                <img
                  src="/batifacile-logo.png"
                  alt="Batifacile"
                  className="h-10 w-auto hidden sm:block"
                />
              </div>

              <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                Accédez à votre espace Batifacile pour piloter vos ventes, inventaires et partenaires en toute sérénité.
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-700">Email professionnel</Label>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#0a7c57] focus-within:border-transparent transition">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@batifacile.com"
                      className="border-none bg-transparent shadow-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Mot de passe</Label>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#0f3d6d] focus-within:border-transparent transition">
                    <Lock className="h-5 w-5 text-gray-500" />
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="border-none bg-transparent shadow-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-700">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                      className="border-gray-300 data-[state=checked]:bg-[#0f3d6d]"
                    />
                    Se souvenir de moi
                  </label>
                  <a
                    className="text-[#0f3d6d] hover:text-[#0a7c57] font-medium"
                    href="mailto:support@batifacile.com"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 flex-none" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 text-sm text-green-700">
                    <CheckCircle2 className="h-5 w-5 flex-none" />
                    <p>Connexion réussie. Redirection en cours...</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0f3d6d] to-[#0a7c57] text-white shadow-lg shadow-[#0a7c57]/20 hover:shadow-xl transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connexion...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Accéder à la plateforme
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Stocks', desc: 'Inventaires mis à jour en temps réel' },
                  { title: 'Partenaires', desc: 'Suivi et traçabilité sécurisée' },
                  { title: 'Rapports', desc: 'Indicateurs prêts pour vos décisions' },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.12em] text-gray-500">{item.title}</p>
                    <p className="text-gray-800 font-semibold mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
