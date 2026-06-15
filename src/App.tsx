/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Camera, 
  Info, 
  Moon, 
  Sun, 
  Calendar, 
  Award, 
  ChevronRight, 
  Share2,
  Check
} from 'lucide-react';
import ConfessionCanvas from './components/ConfessionCanvas';
import { 
  playBoing, 
  playSuccessMelody, 
  playCameraShutter, 
  playHeartbeat 
} from './components/AudioEngine';

type StepType = 'intro' | 'question' | 'accepted';
type ThemeType = 'pink' | 'dark';

export default function App() {
  const [step, setStep] = useState<StepType>('intro');
  const [theme, setTheme] = useState<ThemeType>('pink');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [noCounter, setNoCounter] = useState<number>(0);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [showScreenshotFlash, setShowScreenshotFlash] = useState<boolean>(false);
  const [showDeviceGuide, setShowDeviceGuide] = useState<boolean>(false);
  
  // Love Certificate states
  const [yourName, setYourName] = useState<string>('Mèo');
  const [myName, setMyName] = useState<string>('Vịt');
  const [isEditingCertificate, setIsEditingCertificate] = useState<boolean>(false);

  // Pool of funny messages when they hover over "Không" (dodging)
  const cheekyTexts = [
    "Hụt rồi lêu lêu! 😛",
    "Úi suýt nữa trúng! 😝",
    "Còn lâu nha! 😉",
    "Đừng hòng bấm được! 😜",
    "Hãy bấm 'Đồng ý' đi! 🥺",
    "Không lối thoát đâu! 💖",
    "Nhầm nút rồi cậu ơi! 👉👈",
    "Bên kia dễ bấm hơn nè! ❤️",
    "Tớ thách cậu bấm được đấy! 😎",
    "Bên này không có hạnh phúc đâu! 😘"
  ];

  // Auto transition from 'intro' to 'question' after 3 seconds
  useEffect(() => {
    if (step === 'intro') {
      const timer = setTimeout(() => {
        setStep('question');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Periodic heartbeat sound and effect in the question phase
  useEffect(() => {
    if (step === 'question') {
      const interval = setInterval(() => {
        playHeartbeat(isMuted);
      }, 1400); // 1.4s matching steady resting heart rate
      return () => clearInterval(interval);
    }
  }, [step, isMuted]);

  // Handle No-button dodging
  const handleDodgeNoButton = (e: React.MouseEvent | React.TouchEvent) => {
    playBoing(isMuted);
    
    const btnWidth = 120;
    const btnHeight = 44;
    const margin = 40;

    // Calculate maximum available coordinates
    const maxX = window.innerWidth - btnWidth - margin;
    const maxY = window.innerHeight - btnHeight - margin;

    let targetX = Math.random() * (maxX - margin) + margin;
    let targetY = Math.random() * (maxY - margin) + margin;

    // Fetch the pointer position to push the button away from the pointer
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    if ('clientX' in e) {
      pointerX = e.clientX;
      pointerY = e.clientY;
    } else if ('touches' in e && e.touches[0]) {
      pointerX = e.touches[0].clientX;
      pointerY = e.touches[0].clientY;
    }

    // Measure distance & offset if cursor/tap is too close
    const dx = targetX - pointerX;
    const dy = targetY - pointerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 180) {
      // Repel from cursor
      targetX += dx > 0 ? 150 : -150;
      targetY += dy > 0 ? 150 : -150;
    }

    // Boundary constraints check
    targetX = Math.max(margin, Math.min(maxX, targetX));
    targetY = Math.max(margin, Math.min(maxY, targetY));

    setNoButtonPos({ x: targetX, y: targetY });
    setNoCounter(prev => prev + 1);
  };

  // Click on "Đồng ý"
  const handleAccept = () => {
    setStep('accepted');
    playSuccessMelody(isMuted);
  };

  // Trigger screenshot camera flash
  const handleScreenshotFlash = () => {
    playCameraShutter(isMuted);
    setShowScreenshotFlash(true);
    setTimeout(() => {
      setShowScreenshotFlash(false);
      setShowDeviceGuide(true);
    }, 150);
  };

  // Reset/Re-try love game
  const handleReset = () => {
    setStep('intro');
    setNoCounter(0);
    setNoButtonPos(null);
    setYourName('Cậu');
    setMyName('Tớ');
    setIsEditingCertificate(false);
  };

  return (
    <div 
      id="root-container" 
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden transition-all duration-1000 select-none font-sans ${
        theme === 'pink' 
          ? 'bg-gradient-to-tr from-rose-100 via-pink-50 to-pink-200 text-pink-900' 
          : 'bg-gradient-to-tr from-slate-950 via-purple-950 to-neutral-950 text-purple-100'
      }`}
    >
      {/* Interactive Background Canvas */}
      <ConfessionCanvas 
        activeCelebration={step === 'accepted'} 
        theme={theme} 
      />

      {/* Screen Camera Flash Overlay */}
      <AnimatePresence>
        {showScreenshotFlash && (
          <motion.div 
            id="camera-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Device Guides Modal */}
      <AnimatePresence>
        {showDeviceGuide && (
          <div 
            id="guide-modal-backdrop" 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeviceGuide(false)}
          >
            <motion.div 
              id="guide-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full rounded-3xl p-6 shadow-2xl relative border z-50 ${
                theme === 'pink' 
                  ? 'bg-white border-pink-100 text-slate-800' 
                  : 'bg-slate-900 border-purple-900/60 text-purple-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 border-b border-pink-100/40 pb-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-pink-500">
                  <Camera className="w-5 h-5" /> Cách chụp màn hình
                </h3>
                <button 
                  onClick={() => setShowDeviceGuide(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
                    theme === 'pink' ? 'bg-slate-100' : 'bg-slate-800'
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm mt-2">
                <p className="leading-relaxed opacity-90">
                  Lưu lại khoảnh khắc ngọt ngào này và gửi ngay cho người ấy nhé! 💖
                </p>
                <div className="space-y-2.5">
                  <div className={`p-3 rounded-2xl flex items-start gap-3 ${theme === 'pink' ? 'bg-pink-50' : 'bg-slate-800/60'}`}>
                    <span className="font-bold text-pink-500 min-w-[20px]">📱</span>
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wide opacity-70">iPhone & iPad</p>
                      <p className="text-sm">Bấm đồng thời <strong className="text-pink-500">Nguồn + Tăng âm lượng</strong></p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl flex items-start gap-3 ${theme === 'pink' ? 'bg-pink-50' : 'bg-slate-800/60'}`}>
                    <span className="font-bold text-pink-500 min-w-[20px]">🤖</span>
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wide opacity-70">Android (Samsung, Xiaomi...)</p>
                      <p className="text-sm">Bấm đồng thời <strong className="text-pink-500">Nguồn + Giảm âm lượng</strong></p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl flex items-start gap-3 ${theme === 'pink' ? 'bg-pink-50' : 'bg-slate-800/60'}`}>
                    <span className="font-bold text-pink-500 min-w-[20px]">💻</span>
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wide opacity-70">Máy tính (Windows & Mac)</p>
                      <p className="text-sm">Win: <kbd className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-xs shrink-0 font-mono">PrtScn</kbd> hoặc <kbd className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-xs shrink-0 font-mono">Win+Shift+S</kbd> <br/> Mac: <kbd className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-xs shrink-0 font-mono">Cmd+Shift+3</kbd></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowDeviceGuide(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-semibold shadow-lg text-sm hover:scale-[1.03] transition-all cursor-pointer"
                >
                  Đã hiểu, tiếp tục thôi! ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Control Toolbar (Header) */}
      <header id="controls-toolbar" className="relative z-30 pt-4 px-4 md:px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-lg text-xs md:text-sm">
          <Heart className="w-4 h-4 text-red-500 animate-pulse fill-red-500" />
          <span className="font-display font-semibold tracking-wide">Yêu Thương Đong Đầy</span>
        </div>

        {/* Global toggles: Theme & Sound and Reset */}
        <div className="flex items-center gap-2">
          {/* Mute button */}
          <button 
            id="audio-toggle"
            onClick={() => setIsMuted(prev => !prev)}
            className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all text-xs focus:outline-hidden ${
              theme === 'pink' ? 'hover:bg-pink-100 hover:text-pink-600' : 'hover:bg-purple-900/40 hover:text-purple-400'
            }`}
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5 animate-bounce" />}
          </button>

          {/* Theme switcher */}
          <button 
            id="theme-toggle"
            onClick={() => setTheme(prev => prev === 'pink' ? 'dark' : 'pink')}
            className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all text-xs focus:outline-hidden ${
              theme === 'pink' ? 'hover:bg-pink-100 hover:text-pink-600' : 'hover:bg-purple-900/40 hover:text-purple-400'
            }`}
            title="Đổi giao diện"
          >
            {theme === 'pink' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
          </button>

          {/* Back button option to go back if accepted */}
          {step !== 'intro' && (
            <button 
              id="reset-game-btn"
              onClick={handleReset}
              className={`px-3 py-1.5 text-xs rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-lg font-semibold hover:scale-105 active:scale-95 transition-all focus:outline-hidden ${
                theme === 'pink' ? 'hover:bg-rose-100 text-pink-700' : 'hover:bg-purple-950 text-purple-200'
              }`}
            >
              Xem lại từ đầu 🔄
            </button>
          )}
        </div>
      </header>

      {/* Main Interactive Screen Segment */}
      <main className="relative flex-1 w-full flex flex-col justify-center items-center py-8 px-4 z-20">
        <AnimatePresence mode="wait">
          {/* STEP 1: INITIAL CONFESSION INTRO */}
          {step === 'intro' && (
            <motion.div
              key="intro-phase"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-6 max-w-lg px-4"
            >
              <div className="relative inline-block">
                <motion.div 
                  id="beating-intro-heart"
                  animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-6xl md:text-7xl filter drop-shadow-[0_8px_16px_rgba(244,63,94,0.3)] select-none"
                >
                  💝
                </motion.div>
                <motion.div 
                  animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-0 bg-rose-400/20 rounded-full blur-xl scale-125 -z-10"
                />
              </div>

              {/* Central Title Statement */}
              <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight leading-relaxed animate-pulse">
                Mình có điều muốn nói với cậu...
              </h1>

              {/* Progress Bar indicator */}
              <div className="w-36 h-1 bg-white/20 rounded-full mx-auto overflow-hidden mt-6">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: INTERACTIVE QUESTIONS PANEL */}
          {step === 'question' && (
            <motion.div
              key="question-phase"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className={`w-full max-w-md md:max-w-lg p-6 md:p-8 rounded-3xl border shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative ${
                theme === 'pink' 
                  ? 'bg-white/80 border-white backdrop-blur-md' 
                  : 'bg-slate-950/80 border-purple-900/30 backdrop-blur-md'
              }`}
            >
              {/* Romantic Sparkles and Heart beats icon */}
              <div className="relative mb-4">
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center cursor-pointer shadow-inner"
                  onClick={() => playHeartbeat(isMuted)}
                >
                  <Heart className="w-12 h-12 text-rose-500 fill-rose-500 filter drop-shadow-md" />
                </motion.div>
                <div className="absolute top-0 -right-2 animate-bounce">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              {/* Core Question Text */}
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-center leading-relaxed tracking-wide px-2 py-4 mb-4">
                Cậu làm người yêu mình nhé? 💖
              </h2>

              {/* Cheeky counter commentary for dodging */}
              <AnimatePresence mode="wait">
                {noCounter > 0 && (
                  <motion.p
                    key={`cheeky-${noCounter}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`text-sm font-semibold tracking-wide h-6 mb-4 px-3 py-0.5 rounded-full bg-rose-50 border border-rose-100 ${
                      theme === 'pink' ? 'text-pink-600' : 'text-rose-400 bg-slate-900 border-purple-800/40'
                    }`}
                  >
                    {cheekyTexts[(noCounter - 1) % cheekyTexts.length]}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Interactive Actions Grid */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-2 relative min-h-[160px] sm:min-h-0">
                
                {/* YES BUTTON (Dong y) */}
                <motion.button
                  id="agree-btn"
                  onClick={handleAccept}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white font-bold rounded-2xl shadow-xl shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide flex items-center gap-2 cursor-pointer z-20 w-44 justify-center"
                >
                  <Check className="w-5 h-5 stroke-[3px]" /> Đồng ý 💖
                </motion.button>

                {/* NO BUTTON (Khong) */}
                <motion.button
                  id="dodge-no-btn"
                  onMouseEnter={handleDodgeNoButton}
                  onTouchStart={(e) => {
                    e.preventDefault(); // prevents standard dual hover triggering
                    handleDodgeNoButton(e);
                  }}
                  onClick={handleDodgeNoButton}
                  style={
                    noButtonPos 
                      ? { 
                          position: 'fixed', 
                          left: `${noButtonPos.x}px`, 
                          top: `${noButtonPos.y}px`, 
                          zIndex: 50 
                        } 
                      : { position: 'relative' }
                  }
                  layout={noButtonPos ? true : false}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    layout: { duration: 0.2 } 
                  }}
                  className={`px-8 py-3.5 font-bold rounded-2xl text-base border focus:outline-hidden transition-colors w-44 flex items-center justify-center cursor-pointer ${
                    noButtonPos 
                      ? 'shadow-2xl bg-slate-800 border-slate-700 text-red-400 border-[2px]' 
                      : theme === 'pink' 
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                        : 'bg-slate-900 hover:bg-slate-800 border-purple-900/60 text-purple-300'
                  }`}
                >
                  Không 😢
                </motion.button>

              </div>

              {/* Gentle Helper hint */}
              <p className="text-xs opacity-60 text-center mt-6">
                * Gợi ý: Nút "Đồng ý" luôn luôn đợi cậu 🌸
              </p>
            </motion.div>
          )}

          {/* STEP 3: CONGRATULATIONS AND CELEBRATION */}
          {step === 'accepted' && (
            <motion.div
              key="accepted-phase"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 15 }}
              className="w-full max-w-2xl px-4 flex flex-col items-center space-y-6"
            >
              {/* Primary Celebration Message */}
              <div 
                id="celebration-card" 
                className={`w-full p-6 md:p-8 rounded-3xl border shadow-2xl relative text-center flex flex-col items-center justify-center ${
                  theme === 'pink' 
                    ? 'bg-white/85 border-white backdrop-blur-md' 
                    : 'bg-slate-950/85 border-purple-900/30 backdrop-blur-md'
                }`}
              >
                {/* Floating Heart Ring icon */}
                <div className="relative mb-3 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                    className="absolute inset-0 w-20 h-20 rounded-full border-2 border-dashed border-rose-400/40"
                  />
                  <div className="bg-gradient-to-tr from-pink-500 to-rose-500 w-16 h-16 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    <Heart className="w-9 h-9 text-white fill-white" />
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-wide mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-red-500">
                  Thành Công Rồi! 💕
                </h2>
                
                <p className="text-lg md:text-xl font-bold leading-relaxed px-4 max-w-md text-balance">
                  Yêu cậu nhiều lắm! Chụp màn hình gửi cho mình ngay nhé! 🎉
                </p>

                {/* Auxiliary interactive controls */}
                <div className="mt-6 flex flex-wrap gap-2.5 justify-center w-full max-w-md">
                  
                  {/* Digital Love snapshot camera trigger */}
                  <button
                    id="camera-snap-btn"
                    onClick={handleScreenshotFlash}
                    className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-2xl shadow-md text-sm flex items-center gap-1.5 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Chụp Lại 📸
                  </button>

                  {/* Certificate configuration toggle */}
                  <button
                    id="edit-cert-btn"
                    onClick={() => setIsEditingCertificate(prev => !prev)}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-1.5 hover:scale-[1.03] active:scale-95 transition-all border cursor-pointer ${
                      theme === 'pink'
                        ? 'bg-slate-100 hover:bg-rose-100 border-rose-200 text-pink-700'
                        : 'bg-slate-900 hover:bg-purple-950 border-purple-900/60 text-purple-300'
                    }`}
                  >
                    <Award className="w-4 h-4" /> {isEditingCertificate ? "Đóng Chứng Nhận 📜" : "Ký Chứng Nhận Yêu 📜"}
                  </button>
                </div>
              </div>

              {/* LOVE CERTIFICATE COMPONENT */}
              <AnimatePresence>
                {isEditingCertificate && (
                  <motion.div
                    key="love-certificate-panel"
                    initial={{ opacity: 0, height: 0, y: 15 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full overflow-hidden"
                  >
                    <div className={`p-6 rounded-3xl border shadow-xl relative ${
                      theme === 'pink' 
                        ? 'bg-rose-50/95 border-pink-200/50' 
                        : 'bg-purple-950/30 border-purple-900/60 backdrop-blur-md'
                    }`}>
                      
                      {/* Interactive certificate customized inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 p-3 rounded-2xl bg-white/40 border border-white/20 backdrop-blur-xs">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Tên của cậu 💖</label>
                          <input 
                            type="text" 
                            value={yourName} 
                            onChange={(e) => setYourName(e.target.value)}
                            maxLength={25}
                            placeholder="Nhập tên..."
                            className={`w-full px-3.5 py-1.5 text-sm rounded-xl border focus:outline-hidden transition-all ${
                              theme === 'pink' 
                                ? 'bg-white border-pink-200 text-pink-900 focus:ring-1 focus:ring-pink-400' 
                                : 'bg-slate-900 border-purple-800 text-purple-100 focus:ring-1 focus:ring-purple-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Tên của mình 💞</label>
                          <input 
                            type="text" 
                            value={myName} 
                            onChange={(e) => setMyName(e.target.value)}
                            maxLength={25}
                            placeholder="Nhập tên..."
                            className={`w-full px-3.5 py-1.5 text-sm rounded-xl border focus:outline-hidden transition-all ${
                              theme === 'pink' 
                                ? 'bg-white border-pink-200 text-pink-950 focus:ring-1 focus:ring-pink-400' 
                                : 'bg-slate-900 border-purple-800 text-purple-100 focus:ring-1 focus:ring-purple-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Displayable Certificate frame */}
                      <div className={`p-6 border-4 border-double rounded-2xl relative flex flex-col items-center justify-center text-center shadow-inner ${
                        theme === 'pink'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-slate-950/80 border-purple-900 text-slate-100'
                      }`}>
                        
                        <div className="absolute top-2 left-2 opacity-15"><Award className="w-10 h-10" /></div>
                        <div className="absolute top-2 right-2 opacity-15"><Award className="w-10 h-10" /></div>

                        <span className="font-display font-semibold text-[10px] tracking-widest uppercase opacity-80 mb-1">CỘNG HÒA TÌNH YÊU VIỆT NAM</span>
                        <span className="font-display font-medium text-[8px] tracking-widest opacity-60 uppercase mb-4">Độc lập - Tự do - Hạnh phúc</span>

                        <h3 className="font-display font-extrabold text-xl md:text-2xl text-rose-500 tracking-wide mb-3 uppercase">
                          Giấy Chứng Nhận Tình Yêu
                        </h3>

                        <p className="text-xs italic leading-relaxed opacity-90 max-w-md">
                          Chứng minh đôi bạn đã chính thức khởi đầu một hành trình tuyệt đẹp cùng nhau, hướng tới sự gắn kết, ngọt ngào và quan tâm chân thành.
                        </p>

                        <div className="my-5 flex flex-col items-center">
                          <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base font-bold">
                            <span className="underline decoration-pink-500 decoration-2 underline-offset-4">{yourName || "Người Thương"}</span>
                            <span className="text-rose-500">❤️</span>
                            <span className="underline decoration-pink-500 decoration-2 underline-offset-4">{myName || "Bạn Ấy"}</span>
                          </div>
                        </div>

                        {/* Certificate Date footer */}
                        <div className="w-full flex items-center justify-between text-[11px] opacity-75 mt-4 pt-4 border-t border-dashed border-current/20">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Ngày: 15/06/2026
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-rose-500">
                            Đã Đóng Dấu Chữ Ký ❤️
                          </span>
                        </div>
                      </div>

                      {/* Guide footer inside certificate */}
                      <p className="text-[11px] opacity-65 text-center mt-3">
                        💡 Hãy nhấn "Chụp Lại" bên trên rồi gửi ảnh cho tớ nhé!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Interactive footer message */}
      <footer id="confession-footer" className="relative z-30 pb-4 text-center px-4">
        <p className="text-xs opacity-50 tracking-wider">
          Để bày tỏ sự chân thành • Nhấp vào màn hình pháo hoa sẽ nổ rực rỡ ✨
        </p>
      </footer>
    </div>
  );
}
