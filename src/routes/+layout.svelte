<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { auth } from "$lib/stores/auth.svelte";

  let { children, data } = $props();

  // Sinkronkan auth store dari data server (source of truth = cookie JWT)
  // Ini terjadi sebelum render, jadi request API pertama sudah punya state yang benar
  $effect.pre(() => {
    if (data.user) {
      auth.user = data.user;
      // Ambil token dari localStorage sebagai fallback untuk request header
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("auth_token");
        if (storedToken) {
          auth.token = storedToken;
        }
      }
    } else {
      // Tidak ada sesi server → bersihkan state klien
      auth.user = null;
      auth.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
