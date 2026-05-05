// src/lib/stores/auth.svelte.ts

export type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    // Tambahkan properti lain sesuai kebutuhan dari API
};

class AuthState {
    user = $state<User | null>(null);
    token = $state<string | null>(null);
    initialized = $state(false);

    // Mengecek apakah user sedang login
    get isAuthenticated() {
        return this.token !== null && this.user !== null;
    }

    // Set data saat login sukses
    login(user: User, token: string) {
        this.user = user;
        this.token = token;
        
        // Simpan ke localStorage agar tidak hilang saat direfresh
        // Note: Untuk keamanan ekstra, token bisa juga disimpan di httpOnly cookie
        if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", token);
            localStorage.setItem("auth_user", JSON.stringify(user));
        }
    }

    // Hapus data saat logout
    logout() {
        this.user = null;
        this.token = null;
        
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
        }
    }

    // Memuat data dari localStorage (biasanya dipanggil saat inisialisasi aplikasi di +layout.svelte root)
    init() {
        if (this.initialized) return;

        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("auth_token");
            const storedUser = localStorage.getItem("auth_user");
            
            if (storedToken && storedUser) {
                try {
                    this.token = storedToken;
                    this.user = JSON.parse(storedUser);
                } catch (e) {
                    this.logout(); // Reset jika data corrupt
                }
            }
        }

        this.initialized = true;
    }
}

// Export instance tunggal (singleton)
export const auth = new AuthState();

if (typeof window !== "undefined") {
    auth.init();
}
