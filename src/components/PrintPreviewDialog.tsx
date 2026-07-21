import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  X, 
  Eye, 
  FileText, 
  Sliders, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  Sparkles,
  Maximize2,
  Grid
} from 'lucide-react';
import { PaperType } from '../services/printService';

export interface PrinterNode {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: string;
  ink: number;
  paper: number;
}

export interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentName?: string;
  initialContent?: string;
  owner?: string;
  sourceApp?: string;
  pagesCount?: number;
  availablePrinters?: PrinterNode[];
  onSendToDaemon?: (jobConfig: {
    printerName: string;
    jobName: string;
    copies: number;
    orientation: 'PORTRAIT' | 'LANDSCAPE';
    paperType: PaperType;
    scaling: number;
    halftone: boolean;
    content: string;
    colorMode: 'COLOR' | 'GRAYSCALE';
    margins: 'NORMAL' | 'NARROW' | 'WIDE' | 'NONE';
    dpi: number;
  }) => void;
}

const PAPER_SIZES: Record<string, PaperType> = {
  LETTER: {
    name: 'US Letter',
    widthMm: 215.9,
    heightMm: 279.4,
    printableBounds: { top: 12.7, left: 12.7, right: 203.2, bottom: 266.7 }
  },
  A4: {
    name: 'ISO A4',
    widthMm: 210.0,
    heightMm: 297.0,
    printableBounds: { top: 10.0, left: 10.0, right: 200.0, bottom: 287.0 }
  },
  LEGAL: {
    name: 'US Legal',
    widthMm: 215.9,
    heightMm: 355.6,
    printableBounds: { top: 12.7, left: 12.7, right: 203.2, bottom: 342.9 }
  },
  EXECUTIVE: {
    name: 'Executive',
    widthMm: 184.15,
    heightMm: 266.7,
    printableBounds: { top: 10.0, left: 10.0, right: 174.15, bottom: 256.7 }
  },
  RECEIPT: {
    name: '80mm Thermal Receipt',
    widthMm: 80.0,
    heightMm: 200.0,
    printableBounds: { top: 4.0, left: 4.0, right: 76.0, bottom: 196.0 }
  }
};

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  isOpen,
  onClose,
  documentName = 'GlassOS_Document.pdf',
  initialContent,
  owner = 'admin',
  sourceApp = 'GlassOS System',
  pagesCount = 1,
  availablePrinters = [
    { id: 'p1', name: 'LaserJet-Pro-GlassOS', ip: '192.168.1.100', port: 9100, status: 'online', ink: 78, paper: 92 },
    { id: 'p2', name: 'OfficeJet-Color-NOC', ip: '192.168.1.105', port: 9100, status: 'online', ink: 45, paper: 60 },
    { id: 'p3', name: 'DotMatrix-Legacy-LPT', ip: '192.168.1.200', port: 9100, status: 'offline', ink: 12, paper: 10 }
  ],
  onSendToDaemon
}) => {
  const [selectedPrinter, setSelectedPrinter] = useState<string>(availablePrinters[0]?.name || 'LaserJet-Pro-GlassOS');
  const [selectedPaperKey, setSelectedPaperKey] = useState<string>('LETTER');
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [scaling, setScaling] = useState<number>(100);
  const [halftone, setHalftone] = useState<boolean>(true);
  const [copies, setCopies] = useState<number>(1);
  const [collate, setCollate] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<'COLOR' | 'GRAYSCALE'>('COLOR');
  const [marginSetting, setMarginSetting] = useState<'NORMAL' | 'NARROW' | 'WIDE' | 'NONE'>('NORMAL');
  const [dpi, setDpi] = useState<number>(300);
  const [activePage, setActivePage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showPrintableBounds, setShowPrintableBounds] = useState<boolean>(true);

  const paperType = PAPER_SIZES[selectedPaperKey] || PAPER_SIZES.LETTER;

  // Derive document display content
  const documentBodyText = useMemo(() => {
    if (initialContent && initialContent.trim().length > 0) {
      return initialContent;
    }
    return `================================================================================
                     GLASSOS SYSTEM ARCHITECTURE PRINT REPORT
================================================================================
Document Title: ${documentName}
Originating Service: ${sourceApp}
Security Context: UID 1000 (${owner})
Spool Dispatch Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

[1. SYSTEM SUMMARY]
GlassOS operates on a zero-latency kernel architecture with integrated
GlassPrint Protocol (GPP) streaming daemons. This print job represents a live
raster payload prepared for hardware transmission over port 9100.

[2. TECHNICAL SPECIFICATIONS]
- Virtual Stream Protocol: GPP/TCP v1.4
- Cipher Envelope: AES-256-GPP Signed
- Halftone Vector Dithering: ${halftone ? 'ACTIVE (Floyd-Steinberg 300DPI)' : 'DISABLED'}
- Page Layout: ${paperType.name} (${orientation})
- Color Mode: ${colorMode}
- Target Spool Node: ${selectedPrinter}

[3. EXECUTION LOGS & CHECKSUMS]
0x00000100: 47 4c 41 53 53 4f 53 5f 50 52 49 4e 54 5f 48 45 41 44  |GLASSOS_PRINT_HEAD|
0x00000110: 53 50 4f 4f 4c 5f 56 45 43 54 4f 52 5f 4f 4b 0a 0d 00  |SPOOL_VECTOR_OK...|
================================================================================
                                END OF TRANSMISSION
================================================================================`;
  }, [initialContent, documentName, sourceApp, owner, halftone, paperType, orientation, colorMode, selectedPrinter]);

  // Estimate Ink Usage
  const estimatedInkPercentage = useMemo(() => {
    const textLength = documentBodyText.length;
    const base = (textLength / 500) * 0.12 * copies;
    const multiplier = colorMode === 'COLOR' ? 1.4 : 1.0;
    return Math.min(15.0, Math.max(0.2, parseFloat((base * multiplier).toFixed(2))));
  }, [documentBodyText, copies, colorMode]);

  if (!isOpen) return null;

  const currentPrinterObj = availablePrinters.find(p => p.name === selectedPrinter) || availablePrinters[0];

  const handleDispatchJob = () => {
    if (onSendToDaemon) {
      onSendToDaemon({
        printerName: selectedPrinter,
        jobName: documentName,
        copies,
        orientation,
        paperType,
        scaling,
        halftone,
        content: documentBodyText,
        colorMode,
        margins: marginSetting,
        dpi
      });
    }
    onClose();
  };

  // Calculate paper aspect ratio for render
  const isLandscape = orientation === 'LANDSCAPE';
  const widthMm = isLandscape ? paperType.heightMm : paperType.widthMm;
  const heightMm = isLandscape ? paperType.widthMm : paperType.heightMm;
  const aspectRatio = widthMm / heightMm;

  // Margin padding styling
  const marginPxMap = {
    NORMAL: 'p-8',
    NARROW: 'p-4',
    WIDE: 'p-12',
    NONE: 'p-2'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200 select-none">
        
        {/* Header Bar */}
        <div className="h-16 px-6 bg-slate-900/90 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Printer size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Print Preview & Spool Manager</h3>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full uppercase">
                  GPP Engine v1.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                Document: <span className="text-slate-200 font-semibold">{documentName}</span> ({pagesCount} page{pagesCount > 1 ? 's' : ''})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/5"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          
          {/* Left Settings Sidebar (4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-slate-900/50 border-r border-white/10 p-6 overflow-y-auto no-scrollbar flex flex-col gap-6">
            
            {/* Printer Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Printer size={14} className="text-blue-400" /> Target Network Printer
              </label>
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                {availablePrinters.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.ip}) - {p.status.toUpperCase()}
                  </option>
                ))}
              </select>

              {currentPrinterObj && (
                <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${currentPrinterObj.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span>Status: <strong className="text-white">{currentPrinterObj.status.toUpperCase()}</strong></span>
                  </div>
                  <span>Toner: <strong className="text-blue-400">{currentPrinterObj.ink}%</strong></span>
                  <span>Paper: <strong className="text-amber-400">{currentPrinterObj.paper}%</strong></span>
                </div>
              )}
            </div>

            <div className="h-px bg-white/5" />

            {/* Print Formatting Settings */}
            <div className="flex flex-col gap-4">
              <div className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-cyan-400" /> Formatting & Layout
              </div>

              {/* Paper Size */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-400">Paper Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PAPER_SIZES).map(([key, p]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPaperKey(key)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                        selectedPaperKey === key 
                          ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 font-bold shadow-md shadow-blue-500/5' 
                          : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 mt-0.5">{p.widthMm} x {p.heightMm} mm</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-400">Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrientation('PORTRAIT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      orientation === 'PORTRAIT'
                        ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <RotateCw size={13} className="rotate-0" />
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation('LANDSCAPE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      orientation === 'LANDSCAPE'
                        ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <RotateCw size={13} className="rotate-90" />
                    Landscape
                  </button>
                </div>
              </div>

              {/* Color Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-400">Color Output</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setColorMode('COLOR')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      colorMode === 'COLOR'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Sparkles size={13} className="text-purple-400" />
                    Full Color
                  </button>
                  <button
                    onClick={() => setColorMode('GRAYSCALE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      colorMode === 'GRAYSCALE'
                        ? 'bg-slate-700/50 border-slate-500 text-white'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Layers size={13} />
                    Grayscale
                  </button>
                </div>
              </div>

              {/* Margins & DPI */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400">Margins</label>
                  <select
                    value={marginSetting}
                    onChange={(e: any) => setMarginSetting(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="NORMAL">Normal (12.7mm)</option>
                    <option value="NARROW">Narrow (6.3mm)</option>
                    <option value="WIDE">Wide (25.4mm)</option>
                    <option value="NONE">Zero Margins</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400">Resolution (DPI)</label>
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="bg-slate-950 border border-white/10 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value={150}>150 DPI (Draft)</option>
                    <option value={300}>300 DPI (Standard)</option>
                    <option value={600}>600 DPI (High-Res)</option>
                  </select>
                </div>
              </div>

              {/* Scaling Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Page Scaling</span>
                  <span className="font-mono font-bold text-blue-400">{scaling}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={5}
                  value={scaling}
                  onChange={(e) => setScaling(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Copies & Collate */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400">Copies</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                    className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={collate}
                      onChange={(e) => setCollate(e.target.checked)}
                      className="rounded border-white/10 bg-slate-950 text-blue-500 focus:ring-0"
                    />
                    Collate Pages
                  </label>
                </div>
              </div>

              {/* Halftone & Vector Bounds Toggle */}
              <div className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl flex flex-col gap-2">
                <label className="flex items-center justify-between text-xs font-medium text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Grid size={13} className="text-amber-400" />
                    Simulate Halftone Raster
                  </span>
                  <input
                    type="checkbox"
                    checked={halftone}
                    onChange={(e) => setHalftone(e.target.checked)}
                    className="rounded border-white/10 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-medium text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={13} className="text-cyan-400" />
                    Show Printable Boundaries
                  </span>
                  <input
                    type="checkbox"
                    checked={showPrintableBounds}
                    onChange={(e) => setShowPrintableBounds(e.target.checked)}
                    className="rounded border-white/10 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                </label>
              </div>

            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Est. Toner Consumption:</span>
                <span className="text-emerald-400 font-bold">~{estimatedInkPercentage}%</span>
              </div>
              <button
                onClick={handleDispatchJob}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.99] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <Printer size={16} />
                Send Job to Print Daemon ({copies} Cop{copies > 1 ? 'ies' : 'y'})
              </button>
            </div>

          </div>

          {/* Right Document Preview Stage (8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Toolbar overlay */}
            <div className="flex items-center justify-between z-10 bg-slate-900/80 border border-white/10 backdrop-blur-md p-2 px-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">Page</span>
                <button
                  disabled={activePage <= 1}
                  onClick={() => setActivePage(p => Math.max(1, p - 1))}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono disabled:opacity-30"
                >
                  &lt;
                </button>
                <span className="text-xs font-mono font-bold text-white">{activePage} of {pagesCount}</span>
                <button
                  disabled={activePage >= pagesCount}
                  onClick={() => setActivePage(p => Math.min(pagesCount, p + 1))}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono disabled:opacity-30"
                >
                  &gt;
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-300 w-12 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(150, z + 10))}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="text-[9px] font-mono px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Paper Preview Container */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto no-scrollbar relative">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  width: isLandscape ? '560px' : '420px',
                  height: isLandscape ? '420px' : '560px',
                }}
                className={`relative bg-white text-slate-900 rounded-lg shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                  colorMode === 'GRAYSCALE' ? 'filter grayscale' : ''
                }`}
              >
                {/* Optional Printable Margin Boundary Overlay */}
                {showPrintableBounds && (
                  <div className="absolute inset-4 border border-dashed border-sky-400/50 pointer-events-none rounded flex flex-col justify-between p-1">
                    <span className="text-[8px] font-mono text-sky-500 uppercase tracking-widest font-bold opacity-70">Printable Boundary ({paperType.name})</span>
                    <span className="text-[8px] font-mono text-sky-500 uppercase tracking-widest font-bold opacity-70 text-right">GPP Target Margin</span>
                  </div>
                )}

                {/* Halftone Dot Matrix Texture Overlay */}
                {halftone && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.12]"
                    style={{
                      backgroundImage: 'radial-gradient(#000 1px, transparent 0)',
                      backgroundSize: `${Math.max(2, Math.round(12 - dpi / 60))}px ${Math.max(2, Math.round(12 - dpi / 60))}px`
                    }}
                  />
                )}

                {/* Paper Content Wrapper */}
                <div className={`flex-1 flex flex-col ${marginPxMap[marginSetting]} relative z-0 overflow-hidden font-mono text-[10px] leading-tight select-text`}>
                  
                  {/* Document Page Header */}
                  <div className="border-b-2 border-slate-900/80 pb-2 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-900 flex items-center justify-center text-white text-[7px] font-bold">G</div>
                      <span className="font-bold tracking-wider text-slate-900 uppercase">GlassOS GPP Spooler Vector File</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">{new Date().toLocaleDateString()}</span>
                  </div>

                  {/* Document Title & Meta */}
                  <div className="bg-slate-100 p-2.5 rounded border border-slate-300 mb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{documentName}</h4>
                      <p className="text-[9px] text-slate-600">App: {sourceApp} • Owner: {owner}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-700 uppercase">
                        {dpi} DPI • {scaling}%
                      </span>
                    </div>
                  </div>

                  {/* Page Body Text Stream */}
                  <div className="flex-1 overflow-hidden whitespace-pre-wrap font-mono text-[9px] text-slate-800 leading-normal bg-slate-50/50 p-2 rounded border border-slate-200/80">
                    {documentBodyText}
                  </div>

                  {/* Page Footer */}
                  <div className="border-t border-slate-300 pt-2 mt-3 flex items-center justify-between text-[8px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-2 bg-slate-900 rounded-xs flex items-center justify-around px-0.5">
                        {/* Fake Barcode */}
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className={`h-full ${i % 2 === 0 ? 'w-0.5 bg-white' : 'w-1 bg-slate-800'}`} />
                        ))}
                      </div>
                      <span className="font-bold">GPP-JOB-{Math.floor(Math.random() * 8999 + 1000)}</span>
                    </div>
                    <span className="font-bold text-slate-700">PAGE {activePage} OF {pagesCount}</span>
                  </div>

                </div>

                {/* Corner Paper Fold Visual Effect */}
                <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-slate-300 via-slate-200 to-transparent rounded-bl-md shadow-sm border-b border-l border-slate-300 pointer-events-none" />
              </div>
            </div>

            {/* Bottom Status & Actions bar */}
            <div className="z-10 bg-slate-900/80 border border-white/10 backdrop-blur-md p-3 px-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <FileText size={14} className="text-blue-400" />
                  Format: <strong className="text-white">{paperType.name} ({orientation})</strong>
                </span>
                <span>•</span>
                <span>Resolution: <strong className="text-white">{dpi} DPI</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold text-xs transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatchJob}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Printer size={15} />
                  Print Document
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
