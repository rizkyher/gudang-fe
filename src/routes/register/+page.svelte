<script lang="ts">
  import { Eye, EyeOff, Check } from "@lucide/svelte";
  import { api } from "$lib/api";
  import { goto } from "$app/navigation";

  let fullName  = $state("");
  let email     = $state("");
  let role      = $state("staff");
  let password  = $state("");
  let confirm   = $state("");
  let showPass  = $state(false);
  let showConf  = $state(false);
  let isLoading = $state(false);
  let error     = $state("");
  let step      = $state<1|2>(1);
  let success   = $state(false);

  const roles = [
    { value: "staff",   label: "Staff Gudang" },
    { value: "finance", label: "Finance" },
  ];

  let strength = $derived.by(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  });

  const strengthLabel = $derived(["", "Lemah", "Cukup", "Kuat", "Sangat kuat"][strength]);
  const strengthColor = $derived(["#e5e7eb", "#ef4444", "#f97316", "#3b82f6", "#22c55e"][strength]);

  let passMatch    = $derived(confirm.length > 0 && confirm === password);
  let passMismatch = $derived(confirm.length > 0 && confirm !== password);

  function goNext(e: Event) {
    e.preventDefault();
    error = "";
    if (!fullName.trim()) { error = "Nama lengkap wajib diisi."; return; }
    if (!email.trim())    { error = "Email wajib diisi."; return; }
    step = 2;
  }

  async function handleRegister(e: Event) {
    e.preventDefault();
    error = "";
    if (!password)             { error = "Password wajib diisi."; return; }
    if (password.length < 8)   { error = "Password minimal 8 karakter."; return; }
    if (password !== confirm)  { error = "Konfirmasi password tidak cocok."; return; }
    isLoading = true;
    try {
      await api.post('/auth/register', {
        name: fullName,
        email,
        password,
        role: 'user'
      });
      success = true;
      setTimeout(() => {
        goto('/login');
      }, 1500);
    } catch (e: any) {
      error = e.message || "Gagal membuat akun.";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Daftar · Khwarizmi Inventory</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
</svelte:head>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fade-up  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes step-in  { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
  @keyframes spin     { to { transform:rotate(360deg) } }
  @keyframes pop-in   { from { opacity:0; transform:scale(.8) } to { opacity:1; transform:scale(1) } }

  .page {
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    font-family: 'Inter', sans-serif;
    padding: 24px;
  }

  .card {
    width: 100%;
    max-width: 400px;
    animation: fade-up .5s ease both;
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 40px;
  }
  .brand-icon {
    width: 36px;
    height: 36px;
    background: #111827;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .brand-icon svg {
    width: 18px; height: 18px;
    stroke: #fff; fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .brand-name { font-size: 14px; font-weight: 600; color: #111827; letter-spacing: -.01em; }
  .brand-sub  { font-size: 11px; color: #9ca3af; font-weight: 400; margin-top: 1px; }

  /* Step nav */
  .steps {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 32px;
  }
  .step-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 500;
    color: #d1d5db;
    transition: color .2s;
  }
  .step-item.active { color: #111827; }
  .step-item.done   { color: #6b7280; }
  .step-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 1.5px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10.5px;
    font-weight: 600;
    color: #d1d5db;
    flex-shrink: 0;
    transition: all .2s;
  }
  .step-item.active .step-num {
    border-color: #111827;
    background: #111827;
    color: #fff;
  }
  .step-item.done .step-num {
    border-color: #d1d5db;
    background: #f9fafb;
    color: #9ca3af;
  }
  .step-connector {
    flex: 1;
    height: 1px;
    background: #e5e7eb;
    margin: 0 10px;
    max-width: 40px;
  }

  /* Heading */
  .heading    { font-size: 22px; font-weight: 600; color: #111827; letter-spacing: -.025em; line-height: 1.3; margin-bottom: 6px; }
  .subheading { font-size: 13.5px; color: #6b7280; font-weight: 400; line-height: 1.5; margin-bottom: 28px; }

  /* Form */
  .form { display: flex; flex-direction: column; gap: 16px; animation: step-in .3s ease both; }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 12px; font-weight: 500; color: #374151; letter-spacing: .01em; }

  .input-wrap { position: relative; }

  .input {
    width: 100%;
    padding: 11px 14px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
    font-weight: 400;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    -webkit-appearance: none;
  }
  .input::placeholder { color: #d1d5db; }
  .input:hover  { border-color: #d1d5db; }
  .input:focus  { border-color: #111827; box-shadow: 0 0 0 3px rgba(17,24,39,.07); }
  .input.has-eye { padding-right: 42px; }
  .input.ok     { border-color: #22c55e !important; }
  .input.bad    { border-color: #ef4444 !important; }

  .eye-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    background: none; border: none; color: #9ca3af; cursor: pointer; border-radius: 6px;
    transition: color .15s; padding: 0;
  }
  .eye-btn:hover { color: #374151; }

  /* Role selector */
  .roles {
    display: flex;
    gap: 8px;
  }
  .role-btn {
    flex: 1;
    padding: 9px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 9px;
    background: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all .15s;
    text-align: center;
  }
  .role-btn:hover   { border-color: #d1d5db; color: #374151; }
  .role-btn.active  { border-color: #111827; background: #111827; color: #fff; }

  /* Password strength */
  .pw-bar-track {
    height: 3px;
    background: #f3f4f6;
    border-radius: 4px;
    margin-top: 8px;
    overflow: hidden;
  }
  .pw-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width .3s ease, background-color .3s ease;
  }
  .pw-hint {
    font-size: 11.5px;
    color: #9ca3af;
    margin-top: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Confirm feedback */
  .field-hint {
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
  }

  /* Error */
  .error {
    font-size: 13px;
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 10px 12px;
  }

  /* Divider */
  .divider { height: 1px; background: #f3f4f6; }

  /* Buttons */
  .submit {
    width: 100%;
    padding: 12px;
    background: #111827;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background .15s, transform .1s, box-shadow .15s;
    letter-spacing: -.01em;
  }
  .submit:hover:not(:disabled) { background: #1f2937; box-shadow: 0 4px 12px rgba(17,24,39,.18); }
  .submit:active:not(:disabled) { transform: scale(.99); }
  .submit:disabled { opacity: .5; cursor: not-allowed; }

  .back-btn {
    background: none;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    text-align: center;
    transition: color .15s;
    display: block;
    width: 100%;
  }
  .back-btn:hover { color: #374151; }

  .spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }

  /* Success */
  .success-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 8px 0 4px;
    animation: pop-in .4s cubic-bezier(.22,.68,0,1.3) both;
  }
  .success-circle {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #16a34a;
  }

  /* Footer */
  .footer {
    text-align: center;
    font-size: 13px;
    color: #9ca3af;
    margin-top: 28px;
  }
  .footer a {
    color: #374151;
    font-weight: 500;
    text-decoration: none;
    transition: color .15s;
  }
  .footer a:hover { color: #111827; }
</style>

<div class="page">
  <div class="card">

    <!-- Brand -->
    <div class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <div>
        <div class="brand-name">Khwarizmi Academy</div>
        <div class="brand-sub">Inventory System</div>
      </div>
    </div>

    {#if success}
      <!-- ── SUCCESS ── -->
      <div class="success-wrap">
        <div class="success-circle">
          <Check size={22} />
        </div>
        <div>
          <h2 class="heading" style="margin-bottom:6px">Pendaftaran berhasil</h2>
          <p style="font-size:13.5px; color:#6b7280; line-height:1.6; max-width:300px">
            Akun untuk <strong style="color:#374151; font-weight:500">{email}</strong> telah dibuat.
            Tunggu aktivasi dari admin untuk dapat masuk.
          </p>
        </div>
        <a href="/login" style="display:block; width:100%; margin-top:8px">
          <button class="submit" style="width:100%">Kembali ke Login</button>
        </a>
      </div>

    {:else}
      <!-- Step indicator -->
      <div class="steps">
        <div class="step-item {step === 1 ? 'active' : 'done'}">
          <div class="step-num">{step > 1 ? '✓' : '1'}</div>
          <span>Data diri</span>
        </div>
        <div class="step-connector"></div>
        <div class="step-item {step === 2 ? 'active' : ''}">
          <div class="step-num">2</div>
          <span>Password</span>
        </div>
      </div>

      {#if step === 1}
        <!-- ── STEP 1 ── -->
        <h1 class="heading">Buat akun baru</h1>
        <p class="subheading">Langkah 1 dari 2 — isi data diri Anda.</p>

        <form class="form" onsubmit={goNext}>
          <div class="field">
            <label class="label" for="reg-name">Nama lengkap</label>
            <input id="reg-name" type="text" class="input" bind:value={fullName}
              placeholder="Nama lengkap Anda" autocomplete="name" />
          </div>

          <div class="field">
            <label class="label" for="reg-email">Email</label>
            <input id="reg-email" type="email" class="input" bind:value={email}
              placeholder="nama@khwarizmi.sch.id" autocomplete="email" />
          </div>

          <div class="field">
            <label class="label" for="reg-role">Peran</label>
            <div class="roles" id="reg-role">
              {#each roles as r}
                <button
                  type="button"
                  class="role-btn {role === r.value ? 'active' : ''}"
                  onclick={() => role = r.value}
                >{r.label}</button>
              {/each}
            </div>
          </div>

          {#if error}
            <div class="error">{error}</div>
          {/if}

          <div class="divider"></div>

          <button type="submit" class="submit">Lanjut</button>
        </form>

      {:else}
        <!-- ── STEP 2 ── -->
        <h1 class="heading">Buat password</h1>
        <p class="subheading">Langkah 2 dari 2 — amankan akun Anda.</p>

        <form class="form" onsubmit={handleRegister}>
          <div class="field">
            <label class="label" for="reg-pass">Password</label>
            <div class="input-wrap">
              <input id="reg-pass" type={showPass ? "text" : "password"}
                class="input has-eye"
                bind:value={password}
                placeholder="Minimal 8 karakter"
                autocomplete="new-password" />
              <button type="button" class="eye-btn" onclick={() => showPass = !showPass}
                aria-label="Toggle password visibility">
                {#if showPass}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}
              </button>
            </div>
            {#if password}
              <div class="pw-bar-track">
                <div class="pw-bar-fill"
                  style="width:{strength * 25}%; background-color:{strengthColor}">
                </div>
              </div>
              <div class="pw-hint">
                <span>Gunakan huruf kapital, angka, dan simbol</span>
                {#if strengthLabel}
                  <span style="font-weight:500; color:{strengthColor}">{strengthLabel}</span>
                {/if}
              </div>
            {/if}
          </div>

          <div class="field">
            <label class="label" for="reg-conf">Konfirmasi password</label>
            <div class="input-wrap">
              <input id="reg-conf"
                type={showConf ? "text" : "password"}
                class="input has-eye {passMatch ? 'ok' : passMismatch ? 'bad' : ''}"
                bind:value={confirm}
                placeholder="Ulangi password Anda"
                autocomplete="new-password" />
              <button type="button" class="eye-btn" onclick={() => showConf = !showConf}
                aria-label="Toggle confirm password visibility">
                {#if showConf}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}
              </button>
            </div>
            {#if passMismatch}
              <div class="field-hint" style="color:#ef4444">Password tidak cocok</div>
            {:else if passMatch}
              <div class="field-hint" style="color:#16a34a">Password cocok</div>
            {/if}
          </div>

          {#if error}
            <div class="error">{error}</div>
          {/if}

          <div class="divider"></div>

          <button type="submit" class="submit" disabled={isLoading}>
            {#if isLoading}
              <span class="spinner"></span>
              <span>Membuat akun...</span>
            {:else}
              Selesaikan Pendaftaran
            {/if}
          </button>

          <button type="button" class="back-btn" onclick={() => { step = 1; error = ""; }}>
            ← Kembali
          </button>
        </form>
      {/if}
    {/if}

    {#if !success}
      <p class="footer">
        {step === 1 ? 'Sudah punya akun?' : ''}
        {#if step === 1}<a href="/login">Masuk di sini</a>{/if}
      </p>
    {/if}

  </div>
</div>
