<script lang="ts">
  import { page } from "$app/stores";
  import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    FileText,
  } from "@lucide/svelte";
  import { fly } from "svelte/transition";

  // Mock Request Data
  let requestId = $derived($page.params.id);

  const requestDetails = {
    id: "REQ-2602-005",
    date: "21 Feb 2026, 09:30",
    status: "Diproses",
    note: "Untuk keperluan meeting yayasan",
    items: [
      { name: "Tinta Printer Epson Black", qty: 2, unit: "Botol" },
      { name: "Kertas HVS A4 80gr", qty: 1, unit: "Rim" },
    ],
    timeline: [
      {
        status: "Diajukan",
        time: "21 Feb 2026, 09:30",
        done: true,
        current: false,
        description: "Permintaan berhasil dikirim ke sistem.",
      },
      {
        status: "Diproses Admin",
        time: "21 Feb 2026, 10:15",
        done: true,
        current: true,
        description: "Admin gudang sedang menyiapkan barang.",
      },
      {
        status: "Menunggu Diambil",
        time: "-",
        done: false,
        current: false,
        description: "Barang siap diambil di ruang Gudang IT.",
      },
      {
        status: "Selesai",
        time: "-",
        done: false,
        current: false,
        description: "Barang telah diterima oleh pemohon.",
      },
    ],
  };
</script>

<svelte:head>
  <title>Detail Permintaan {requestId}</title>
</svelte:head>

<!-- Header -->
<div
  class="bg-blue-600 px-6 pt-12 pb-24 rounded-b-[40px] text-white relative shadow-md z-20"
>
  <div class="flex items-center gap-4 mb-4">
    <a
      href="/user/history"
      class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors active:scale-95 shrink-0"
    >
      <ArrowLeft size={24} />
    </a>
    <div>
      <h1 class="text-xl font-black tracking-tight truncate">
        Detail Permintaan
      </h1>
      <p class="text-blue-200 text-xs font-medium mt-0.5">{requestId}</p>
    </div>
  </div>
</div>

<main class="px-6 -mt-16 relative z-30 pb-24 space-y-4">
  <!-- Info Card -->
  <div
    in:fly={{ y: 20, duration: 400 }}
    class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-4"
  >
    <div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Status Saat Ini
      </p>
      <h2 class="text-lg font-black text-amber-600 mt-0.5">
        {requestDetails.status}
      </h2>
      <p class="text-[11px] font-medium text-slate-500 mt-1">
        {requestDetails.date}
      </p>
    </div>
    <div
      class="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-100/50"
    >
      <Clock size={28} />
    </div>
  </div>

  <!-- Timeline -->
  <div
    in:fly={{ y: 20, duration: 400, delay: 100 }}
    class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
  >
    <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm">
      <MapPin size={16} class="text-blue-500" />
      Lacak Proses
    </h3>

    <div
      class="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent pl-2"
    >
      {#each requestDetails.timeline as step, i}
        <div
          class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
        >
          <!-- Icon Indicator -->
          <div
            class="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10
            {step.done
              ? step.current
                ? 'bg-amber-500 text-white'
                : 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-400'}"
          >
            {#if step.done && !step.current}
              <CheckCircle2 size={12} strokeWidth={4} />
            {:else if step.current}
              <div
                class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"
              ></div>
            {/if}
          </div>

          <!-- Content -->
          <div class="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4">
            <div class="flex flex-col">
              <h4
                class="text-sm font-bold {step.done
                  ? 'text-slate-800'
                  : 'text-slate-400'}"
              >
                {step.status}
              </h4>
              <p
                class="text-[10px] font-medium {step.done
                  ? 'text-slate-500'
                  : 'text-slate-300'} mt-0.5"
              >
                {step.time}
              </p>
              <p
                class="text-xs mt-1 leading-relaxed {step.done
                  ? 'text-slate-600'
                  : 'text-slate-400'}"
              >
                {step.description}
              </p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Items Card -->
  <div
    in:fly={{ y: 20, duration: 400, delay: 200 }}
    class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
  >
    <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
      <Package size={16} class="text-blue-500" />
      Daftar Barang
    </h3>

    <div class="space-y-3">
      {#each requestDetails.items as item}
        <div
          class="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/60"
        >
          <div>
            <p class="font-bold text-slate-800 text-sm">{item.name}</p>
          </div>
          <div
            class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm text-xs font-black text-blue-600"
          >
            {item.qty}
            <span class="font-semibold text-slate-500 text-[10px] normal-case"
              >{item.unit}</span
            >
          </div>
        </div>
      {/each}
    </div>

    {#if requestDetails.note}
      <div
        class="mt-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3"
      >
        <FileText size={16} class="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p
            class="text-[10px] font-bold text-blue-800 uppercase tracking-wide"
          >
            Catatan Pemohon
          </p>
          <p class="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
            {requestDetails.note}
          </p>
        </div>
      </div>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    background-color: #f8fafc;
  }
</style>
