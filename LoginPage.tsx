
import React, { useState, useEffect } from 'react';

interface LoginPageProps {
  onLogin: (usernameOrEmail: string, passwordInput: string) => Promise<void>;
  loginError: string | null;
  onNavigateToRegister: () => void; // Yeni prop eklendi
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loginError, onNavigateToRegister }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    setInternalError(loginError);
  }, [loginError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null); 
    if (!usernameOrEmail || !passwordInput) {
      setInternalError("Kullanıcı adı/e-posta ve şifre alanları zorunludur.");
      return;
    }
    setIsLoading(true);
    await onLogin(usernameOrEmail, passwordInput);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.353-.026.692-.026 1.032 0 1.13.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5c0 1.135-.845 2.098-1.976 2.192a48.424 48.424 0 00-1.032 0C4.12 9.69 3.275 8.727 3.275 7.692V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.032 0c1.13.094 1.976 1.057 1.976 2.192V7.5m0 0c0 1.135.845 2.098 1.976 2.192.353-.026.692-.026 1.032 0 1.13.094 1.976 1.057 1.976 2.192V10.5A2.25 2.25 0 0018 12.75v.165c0 .541-.1.999-.275 1.436M18 12.75v2.036c0 .541-.1.999-.275 1.436M18 12.75c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.032 0c-1.13.094-1.976 1.057-1.976 2.192v2.036c0 .541.1.999.275 1.436m13.5 0c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.032 0c-1.13.094-1.976 1.057-1.976 2.192v4.436c0 .541.1.999.275 1.436M12 12.75h6M12 12.75c-1.135 0-2.098.845-2.192 1.976a48.424 48.424 0 000 1.032c.094 1.13 1.057 1.976 2.192 1.976h2.036c.541 0 .999-.1 1.436-.274M12 12.75V10.5M12 12.75c-1.135 0-2.098.845-2.192 1.976a48.424 48.424 0 000 1.032c.094 1.13 1.057 1.976 2.192 1.976H12M6.75 17.25h.008v.008H6.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          <h1 className="text-3xl font-bold text-slate-700">B2B Katalog Pro</h1>
          <p className="text-gray-600 mt-2">Lütfen devam etmek için giriş yapın.</p>
        </div>

        {internalError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
            {internalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label 
              htmlFor="usernameOrEmail" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kullanıcı Adı veya E-posta
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              placeholder="Kullanıcı adınız veya eposta@adresiniz.com"
              required
              disabled={isLoading}
              aria-describedby="error-message"
            />
          </div>
          <div className="mb-6">
            <label 
              htmlFor="password_field"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Şifre
            </label>
            <input
              type="password"
              id="password_field"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
              aria-describedby="error-message"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-medium text-orange-600 hover:text-orange-500"
              disabled={isLoading}
            >
              Üyelik Talebi Oluşturun
            </button>
          </p>
        </div>

         <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-semibold mb-1">Demo Kullanıcı Bilgileri:</p>
          <p><strong>Süper Admin:</strong> K.Adı "Roxoe" / E-posta "yusuf.yavuz@roxoe.com.tr", Şifre "admin123"</p>
          <p><strong>Yönetici:</strong> K.Adı "Mudur" / E-posta "mudur@ornek.com", Şifre "mudur123"</p>
        </div>
      </div>
       <footer className="text-center text-sm text-gray-400 py-6 mt-8">
        &copy; {new Date().getFullYear()} B2B Katalog Pro. Tüm hakları saklıdır.
      </footer>
    </div>
  );
};

export default LoginPage;