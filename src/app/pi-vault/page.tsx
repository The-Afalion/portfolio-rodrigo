"use client";

import { useState } from "react";
import { Binary, Lock, RefreshCw, ShieldCheck, Unlock } from "lucide-react";
import { generateOffsetFromKey, encryptData, decryptData, textToBytes, bytesToText, bytesToHex } from "@/lib/pi-engine";
import { PageHero, PageShell, SectionInset, SectionPanel } from "@/components/shell/PagePrimitives";

export default function PiVaultPage() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [output, setOutput] = useState("");
  const [isHex, setIsHex] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async (mode: "encrypt" | "decrypt") => {
    if (!key) {
      alert("Se requiere una clave maestra para localizar la posición en Pi.");
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const offset = await generateOffsetFromKey(key);
      let resultBytes: Uint8Array;

      if (mode === "encrypt") {
        const dataBytes = textToBytes(input);
        resultBytes = encryptData(dataBytes, offset);
        setOutput(bytesToHex(resultBytes));
        setIsHex(true);
      } else {
        const hexString = input.replace(/\s/g, "");
        const bytes = new Uint8Array(hexString.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
        resultBytes = decryptData(bytes, offset);
        setOutput(bytesToText(resultBytes));
        setIsHex(false);
      }
    } catch {
      setOutput("ERROR: Datos corruptos o clave incorrecta.");
    }

    setProcessing(false);
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorio"
        title="Pi Vault"
        description="Experimento criptográfico presentado como herramienta, no como pantalla temática. El protagonismo lo tienen el flujo y la lectura."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionPanel className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Clave maestra</label>
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3">
              <Lock size={16} className="text-muted-foreground" />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Introduce tu secreto"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Datos de entrada</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Texto plano para encriptar o código hexadecimal para desencriptar"
              className="min-h-[220px] w-full rounded-[1.5rem] border border-border/80 bg-background/70 p-4 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleProcess("encrypt")}
              disabled={processing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {processing ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
              Encriptar
            </button>
            <button
              onClick={() => handleProcess("decrypt")}
              disabled={processing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border/80 bg-background/70 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent/30 disabled:opacity-50"
            >
              {processing ? <RefreshCw size={16} className="animate-spin" /> : <Unlock size={16} />}
              Desencriptar
            </button>
          </div>
        </SectionPanel>

        <div className="space-y-4">
          <SectionInset className="space-y-4">
            <div className="flex items-center gap-3">
              <Binary size={18} className="text-primary" />
              <p className="text-sm font-medium text-foreground">Salida del sistema</p>
            </div>
            <div className="min-h-[240px] rounded-[1.25rem] border border-border/80 bg-background/75 p-4 text-xs leading-7 text-foreground">
              {output || <span className="text-muted-foreground">Esperando flujo de datos...</span>}
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{isHex ? "Hexadecimal" : "Texto plano"}</p>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">El experimento mantiene su personalidad técnica, pero la interfaz ya pertenece al mismo sistema que el resto de la web.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
