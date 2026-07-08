import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Video, 
  Camera, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Disc, 
  Download, 
  Save, 
  Trash2, 
  Circle, 
  Sliders, 
  X, 
  Volume2, 
  VolumeX, 
  Monitor, 
  User, 
  Play, 
  Square,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define camera filters
interface CameraFilter {
  id: string;
  name: string;
  class: string;
  style: string;
}

const CAMERA_FILTERS: CameraFilter[] = [
  { id: 'normal', name: 'Normal', class: '', style: 'none' },
  { id: 'glass', name: 'Glass Glow', class: 'saturate-[1.3] brightness-[1.1] contrast-[1.05]', style: 'saturate(1.3) brightness(1.1) contrast(1.05)' },
  { id: 'mono', name: 'Slate Mono', class: 'grayscale contrast-[1.25]', style: 'grayscale(1) contrast(1.25)' },
  { id: 'cyber', name: 'Cyber Neon', class: 'hue-rotate-[300deg] saturate-[1.6] contrast-[1.1]', style: 'hue-rotate(300deg) saturate(1.6) contrast(1.1)' },
  { id: 'retro', name: 'Retro VHS', class: 'sepia-[0.25] contrast-[0.9] brightness-[1.05] saturate-[1.15]', style: 'sepia(0.25) contrast(0.9) brightness(1.05) saturate(1.15)' },
  { id: 'nocturnal', name: 'Nocturnal', class: 'sepia-[0.8] hue-rotate-[85deg] saturate-[3] brightness-[0.9]', style: 'sepia(0.8) hue-rotate(85deg) saturate(3) brightness(0.9)' }
];

interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  avatarColor: string;
  replies: string[];
}

const CONTACTS: Contact[] = [
  { 
    id: '1', 
    name: 'Alice (SysAdmin)', 
    role: 'Infrastructure Lead', 
    status: 'online', 
    avatarColor: 'bg-emerald-500',
    replies: [
      "Connecting secure tunnel... Clear channel established.",
      "Loud and clear! I'm monitoring the main server grid, latency looks fantastic on this GlassOS stream.",
      "The filesystem persistence is running green. Let me know if you need to run some terminal commands.",
      "I'm looking into the network protocols. Speak to you soon!"
    ]
  },
  { 
    id: '2', 
    name: 'Bob (Core Engineer)', 
    role: 'Kernel Developer', 
    status: 'online', 
    avatarColor: 'bg-blue-500',
    replies: [
      "Hey! Just compiling the latest OS build. What's up?",
      "Yeah, I see your video stream. Framerate is solid. WebRTC loopback looks clean.",
      "Have you tried running any brainscripts? The sandbox is compiling in under 5ms.",
      "Let's catch up later at the design standup."
    ]
  },
  { 
    id: '3', 
    name: 'Carol (UI/UX Designer)', 
    role: 'Creative Director', 
    status: 'away', 
    avatarColor: 'bg-pink-500',
    replies: [
      "Oh, hey! Loving the glassmorphic aesthetics on this call. The frosted panels are beautiful.",
      "Your video stream looks very futuristic. Let's adjust the drop shadows on the Window components next.",
      "Can we talk about the color contrast in the browser app later? I have some ideas.",
      "Design is looking pristine. Keep up the great work!"
    ]
  },
  { 
    id: '4', 
    name: 'GlassOS AI Assistant', 
    role: 'Virtual Companion', 
    status: 'online', 
    avatarColor: 'bg-purple-500',
    replies: [
      "Greetings! I am the integrated GlassOS helper. How can I assist you on this call?",
      "This video feed is highly optimized. I'm parsing your video frame data and extracting layout recommendations.",
      "GlassOS has full terminal capabilities, custom browsers, calendar synchronizers, and beautiful desktop workspaces.",
      "If you need any code written, open the Code Studio or ask me! I'm here to build."
    ]
  }
];

export function VideoStudioApp({ fsLib, addNotification }: any) {
  const [activeTab, setActiveTab] = useState<'record' | 'chat'>('record');
  
  // Camera & Stream states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('normal');
  const [hasCameraError, setHasCameraError] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [savedVideos, setSavedVideos] = useState<{name: string, url: string, date: string}[]>([]);

  // Video Call states
  const [selectedContact, setSelectedContact] = useState<Contact>(CONTACTS[0]);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, time: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [remoteSpeechText, setRemoteSpeechText] = useState('Connection Pending...');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const callVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeRingerRef = useRef<{ stop: () => void } | null>(null);
  const remoteSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize/start the camera stream
  const startCamera = async (isForCall = false, resToUse = resolution) => {
    try {
      setHasCameraError(false);
      // If we have an existing stream, stop all tracks first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      let width = 1280;
      let height = 720;
      if (resToUse === '480p') {
        width = 640;
        height = 480;
      } else if (resToUse === '1080p') {
        width = 1920;
        height = 1080;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: width }, height: { ideal: height }, facingMode: 'user' },
        audio: true
      });

      setStream(mediaStream);
      setIsMicEnabled(true);
      setIsVideoEnabled(true);

      const targetVideo = isForCall ? callVideoRef.current : videoRef.current;
      if (targetVideo) {
        targetVideo.srcObject = mediaStream;
        targetVideo.play().catch(e => console.warn("Video play failed:", e));
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setHasCameraError(true);
      addNotification('VideoStudio', 'Failed to access camera/microphone. Please ensure you granted permissions.', 'error');
    }
  };

  const handleResolutionChange = async (newRes: '480p' | '720p' | '1080p') => {
    setResolution(newRes);
    addNotification('VideoStudio', `Quality settings updated to ${newRes}`, 'success');
    if (stream && !isRecording) {
      await startCamera(activeTab === 'chat', newRes);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (isRecording) {
      stopRecording();
    }
  };

  // Toggle mic/video tracks
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
        addNotification('VideoStudio', `Microphone ${audioTrack.enabled ? 'Enabled' : 'Muted'}`, 'info');
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        addNotification('VideoStudio', `Camera stream ${videoTrack.enabled ? 'Enabled' : 'Disabled'}`, 'info');
      }
    }
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      await startCamera(activeTab === 'chat');
      setIsScreenSharing(false);
      addNotification('VideoStudio', 'Screen sharing stopped. Reverted to camera.', 'info');
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }

        setStream(displayStream);
        setIsScreenSharing(true);
        addNotification('VideoStudio', 'Screen sharing started', 'success');

        const targetVideo = activeTab === 'chat' ? callVideoRef.current : videoRef.current;
        if (targetVideo) {
          targetVideo.srcObject = displayStream;
        }

        // Listen for screen share stop from browser UI
        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          startCamera(activeTab === 'chat');
          addNotification('VideoStudio', 'Screen sharing stopped', 'info');
        };
      } catch (err) {
        console.warn("Screen share declined or failed:", err);
      }
    }
  };

  // Audio Synthesizer for ringtones
  const playSynthSound = (type: 'ring' | 'connect' | 'disconnect') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      
      if (type === 'ring') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.frequency.setValueAtTime(400, ctx.currentTime);
        osc2.frequency.setValueAtTime(450, ctx.currentTime);
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        
        // Loop cadence
        let time = ctx.currentTime;
        const interval = 5; // seconds
        for (let i = 0; i < 5; i++) {
          gain.gain.setValueAtTime(0.1, time);
          gain.gain.setValueAtTime(0, time + 1.5);
          time += interval;
        }
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        return {
          stop: () => {
            try {
              osc1.stop();
              osc2.stop();
              ctx.close();
            } catch (e) {}
          }
        };
      } else if (type === 'connect') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        setTimeout(() => ctx.close(), 500);
      } else if (type === 'disconnect') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.setValueAtTime(300, ctx.currentTime + 0.15);
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        setTimeout(() => ctx.close(), 500);
      }
    } catch (e) {
      console.warn("Synth sound error:", e);
    }
    return null;
  };

  // Start video recording
  const startRecording = () => {
    if (!stream) {
      addNotification('VideoStudio', 'Cannot record without camera stream. Try clicking Start Camera first.', 'warning');
      return;
    }

    recordedChunksRef.current = [];
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8,opus' };
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
    }

    try {
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        addNotification('VideoStudio', 'Video recording completed. Ready to preview or save.', 'success');
      };

      setRecordingDuration(0);
      setIsRecording(true);
      recorder.start(1000); // chunk every 1s

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      addNotification('VideoStudio', 'Recording started...', 'info');
    } catch (e) {
      console.error("Recording start failed:", e);
      addNotification('VideoStudio', 'Failed to start video recording', 'error');
    }
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Take Snapshot
  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !stream) {
      addNotification('VideoStudio', 'Camera stream is offline. Cannot take photo.', 'warning');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply filter to snapshot
        const selectedFilterObj = CAMERA_FILTERS.find(f => f.id === activeFilter);
        if (selectedFilterObj && selectedFilterObj.style !== 'none') {
          ctx.filter = selectedFilterObj.style;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        
        // Save to virtual filesystem Documents/Photos
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `snapshot_${timestamp}.png`;
        fsLib.write(`Documents/Photos/${filename}`, dataUrl);
        addNotification('VideoStudio', `Snapshot saved as Documents/Photos/${filename}`, 'success');
        
        // Play a fake click flash effect
        const flashEl = document.createElement('div');
        flashEl.className = 'fixed inset-0 bg-white/80 z-[99999] pointer-events-none transition-opacity duration-300';
        document.body.appendChild(flashEl);
        setTimeout(() => {
          flashEl.style.opacity = '0';
          setTimeout(() => flashEl.remove(), 300);
        }, 50);
      }
    } catch (err) {
      console.error("Snapshot failed:", err);
      addNotification('VideoStudio', 'Snapshot capture failed', 'error');
    }
  };

  // Save recorded video to Documents/Videos
  const saveRecordedVideo = async () => {
    if (!recordedBlob) return;
    
    try {
      // Read blob as DataURL
      const reader = new FileReader();
      reader.readAsDataURL(recordedBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `record_${timestamp}.webm`;
        
        // Write to Virtual FS under Documents/Videos
        fsLib.write(`Documents/Videos/${filename}`, base64data);
        
        const newSave = {
          name: filename,
          url: recordedVideoUrl!,
          date: new Date().toLocaleTimeString()
        };
        
        setSavedVideos(prev => [newSave, ...prev]);
        addNotification('VideoStudio', `Saved video to Documents/Videos/${filename}`, 'success');
        setRecordedVideoUrl(null);
        setRecordedBlob(null);
      };
    } catch (e) {
      console.error("Save video failed:", e);
      addNotification('VideoStudio', 'Could not save video to file system', 'error');
    }
  };

  // Trigger outbound video call
  const startVideoCall = () => {
    if (callState !== 'idle') return;
    
    setCallState('calling');
    setChatMessages([]);
    setCallDuration(0);
    setRemoteSpeechText('Connecting secure stream...');
    addNotification('VideoStudio', `Placing secure encrypted video call to ${selectedContact.name}...`, 'info');
    
    // Play ringback sound synthesizers
    activeRingerRef.current = playSynthSound('ring');

    // Simulate connection delay
    setTimeout(() => {
      if (activeRingerRef.current) {
        activeRingerRef.current.stop();
        activeRingerRef.current = null;
      }
      
      playSynthSound('connect');
      setCallState('connected');
      addNotification('VideoStudio', `Call connected with ${selectedContact.name}`, 'success');

      // Start camera for call if not active
      if (!stream) {
        startCamera(true);
      }

      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Add connection log message
      const initialMsgs = [
        { sender: 'System', text: `Call started with ${selectedContact.name} at ${new Date().toLocaleTimeString()}`, time: new Date().toLocaleTimeString() },
        { sender: selectedContact.name, text: selectedContact.replies[0], time: new Date().toLocaleTimeString() }
      ];
      setChatMessages(initialMsgs);
      setRemoteSpeechText(selectedContact.replies[0]);
    }, 4000);
  };

  // Hang up call
  const endVideoCall = () => {
    if (callState === 'idle') return;

    if (activeRingerRef.current) {
      activeRingerRef.current.stop();
      activeRingerRef.current = null;
    }

    playSynthSound('disconnect');
    setCallState('idle');
    setRemoteSpeechText('Call disconnected');
    addNotification('VideoStudio', `Call with ${selectedContact.name} ended. Total duration: ${formatTime(callDuration)}`, 'info');

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (remoteSpeechTimerRef.current) {
      clearTimeout(remoteSpeechTimerRef.current);
      remoteSpeechTimerRef.current = null;
    }
  };

  // Send message in call chat
  const sendChatMessage = () => {
    if (!chatInput.trim() || callState !== 'connected') return;

    const userMsg = {
      sender: 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const typedText = chatInput;
    setChatInput('');

    // Trigger simulated remote peer typing/speaking state
    setRemoteSpeechText('Typing...');
    
    remoteSpeechTimerRef.current = setTimeout(() => {
      // Pick a semi-random response from contact
      const contactReplies = selectedContact.replies;
      const randomReply = contactReplies[Math.floor(Math.random() * (contactReplies.length - 1)) + 1];
      
      const remoteMsg = {
        sender: selectedContact.name,
        text: randomReply,
        time: new Date().toLocaleTimeString()
      };

      setChatMessages(prev => [...prev, remoteMsg]);
      setRemoteSpeechText(randomReply);
      
      // Flash remote speaking effect
      const visualizerDot = document.getElementById('remote-indicator-pulse');
      if (visualizerDot) {
        visualizerDot.classList.add('scale-[1.8]', 'bg-blue-400');
        setTimeout(() => visualizerDot.classList.remove('scale-[1.8]', 'bg-blue-400'), 1000);
      }
    }, 2000);
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Clean list of saved videos on mount or change
  useEffect(() => {
    try {
      const fetchSavedVideos = () => {
        const vids = fsLib.list('Documents/Videos') || [];
        setSavedVideos(vids.filter((f: any) => f.type === 'file').map((f: any) => ({
          name: f.name,
          url: f.content, // Since it's saved as Base64 DataURL, we can use it directly
          date: f.dateModified || 'Recent'
        })));
      };
      fetchSavedVideos();
    } catch (e) {
      console.warn("Could not load video library", e);
    }
  }, [fsLib]);

  // Handle switching tabs (record stream vs chat)
  useEffect(() => {
    if (activeTab === 'record') {
      startCamera(false);
    } else {
      if (callState === 'connected') {
        startCamera(true);
      } else {
        stopCamera();
      }
    }
    return () => {
      // Only stop camera if exiting the entire component completely or switching
    };
  }, [activeTab]);

  // Clean up component on unmount
  useEffect(() => {
    startCamera(false);
    return () => {
      stopCamera();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (remoteSpeechTimerRef.current) clearTimeout(remoteSpeechTimerRef.current);
      if (activeRingerRef.current) activeRingerRef.current.stop();
    };
  }, []);

  const filterStyleClass = useMemo(() => {
    const selectedObj = CAMERA_FILTERS.find(f => f.id === activeFilter);
    return selectedObj ? selectedObj.class : '';
  }, [activeFilter]);

  return (
    <div className="h-full flex flex-col bg-[#080d19] text-white font-sans overflow-hidden">
      
      {/* App Toolbar Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Video size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Video & Camera Studio</h2>
            <p className="text-[9px] text-slate-400 font-mono tracking-tight uppercase">GLASSOS MULTIMEDIA SUBSYSTEM</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-xl p-1 text-[11px] font-semibold">
          <button 
            onClick={() => setActiveTab('record')}
            className={`px-4 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${activeTab === 'record' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Camera size={13} />
            <span>Camera & Record</span>
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Phone size={13} />
            <span>Simulated Video Chat</span>
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- RECORDING & PHOTO CAMERA TAB --- */}
        {activeTab === 'record' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Camera Preview Section */}
            <div className="flex-1 flex flex-col p-6 space-y-4">
              <div className="flex-1 relative bg-slate-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center group">
                
                {/* Active Video Stream */}
                {stream && isVideoEnabled ? (
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover rounded-3xl transition-all ${filterStyleClass}`}
                  />
                ) : (
                  <div className="text-center space-y-3 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                      <VideoOff size={28} />
                    </div>
                    <p className="text-xs font-mono text-slate-300">Camera stream is currently inactive</p>
                    <button 
                      onClick={() => startCamera(false)}
                      className="px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600/30 text-blue-400 text-[10px] rounded-xl font-bold uppercase tracking-wider border border-blue-500/20 cursor-pointer"
                    >
                      Start Live Stream
                    </button>
                  </div>
                )}

                {/* Custom glowing overlays and scanning indicators to feel like real military/hightech OS */}
                <div className="absolute inset-0 pointer-events-none border border-blue-500/20 rounded-3xl" />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${stream ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-slate-300">STREAM: {stream ? 'ONLINE' : 'OFFLINE'}</span>
                </div>

                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-[10px] font-bold font-mono text-white animate-pulse shadow-lg shadow-red-500/20 border border-red-400/30">
                    <Disc size={11} className="animate-spin" />
                    <span>REC {formatTime(recordingDuration)}</span>
                  </div>
                )}

                {/* Cyberpunk Scanner Overlays */}
                <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-md bg-black/55 backdrop-blur-md text-[8px] font-mono text-slate-400 border border-white/5 pointer-events-none uppercase">
                  GLASS_ENC v1.4 // fps: 30 // RES: {resolution}
                </div>
              </div>

              {/* Live Filter Controls */}
              <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Sliders size={14} className="text-blue-400" />
                  <span>Interactive Video Filters:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CAMERA_FILTERS.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setActiveFilter(filter.id);
                        addNotification('VideoStudio', `Applied ${filter.name} filter`, 'info');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${activeFilter === filter.id ? 'bg-blue-600 text-white border-transparent shadow' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'}`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex justify-center items-center gap-3">
                <button 
                  onClick={toggleMic}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer border transition-all ${isMicEnabled ? 'bg-slate-900 border-white/10 hover:bg-slate-800 text-white' : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'}`}
                  title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {isMicEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                
                <button 
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer border transition-all ${isVideoEnabled ? 'bg-slate-900 border-white/10 hover:bg-slate-800 text-white' : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'}`}
                  title={isVideoEnabled ? "Disable Camera" : "Enable Camera"}
                >
                  {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                </button>

                <button 
                  onClick={toggleScreenShare}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer border transition-all ${isScreenSharing ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30' : 'bg-slate-900 border-white/10 hover:bg-slate-800 text-white'}`}
                  title="Toggle Screen Sharing"
                >
                  <Monitor size={18} />
                </button>

                {/* Quality settings dropdown */}
                <div className="relative">
                  <button 
                    disabled={isRecording}
                    onClick={() => setShowQualityDropdown(!showQualityDropdown)}
                    className={`w-14 h-12 rounded-2xl flex flex-col items-center justify-center cursor-pointer border transition-all ${isRecording ? 'opacity-40 cursor-not-allowed bg-slate-900 border-white/5 text-slate-500' : 'bg-slate-900 border-white/10 hover:bg-slate-800 text-white'}`}
                    title="Change Recording Quality"
                  >
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-tight leading-none">RES</span>
                    <span className="text-[10px] text-blue-400 font-extrabold font-mono mt-0.5 leading-none">{resolution}</span>
                  </button>

                  <AnimatePresence>
                    {showQualityDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowQualityDropdown(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-14 left-1/2 -translate-x-1/2 w-40 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                        >
                          <div className="px-2 py-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-white/5 mb-1 text-center">
                            Output Quality
                          </div>
                          {(['480p', '720p', '1080p'] as const).map((res) => (
                            <button
                              key={res}
                              onClick={() => {
                                handleResolutionChange(res);
                                setShowQualityDropdown(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${resolution === res ? 'bg-blue-600 text-white font-bold' : 'hover:bg-white/5 text-slate-300'}`}
                            >
                              <span>{res === '480p' ? 'SD (480p)' : res === '720p' ? 'HD (720p)' : 'FHD (1080p)'}</span>
                              {resolution === res && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-8 bg-white/10 mx-2" />

                {/* Primary Photo Shoot Button */}
                <button 
                  onClick={takeSnapshot}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-white/5 active:scale-95"
                >
                  <Camera size={14} className="text-blue-400" />
                  <span>Take Snapshot</span>
                </button>

                {/* Primary Record Button */}
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20 hover:shadow-red-500/30 active:scale-95"
                  >
                    <Disc size={14} className="animate-pulse" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 animate-pulse"
                  >
                    <Square size={14} className="fill-slate-900" />
                    <span>Stop Recording</span>
                  </button>
                )}

                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Visual Recording Duration Timer Panel */}
                <div className="flex items-center gap-3 bg-slate-950/80 border border-white/10 px-4 py-2 rounded-2xl font-mono shadow-inner min-w-[130px] justify-center transition-all">
                  <div className="flex flex-col items-center">
                    <span className="text-[7.5px] text-slate-500 uppercase tracking-widest font-extrabold leading-none mb-1">DUR TIMER</span>
                    <span className={`text-sm font-extrabold tabular-nums tracking-wider leading-none ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                      {formatTime(recordingDuration)}
                    </span>
                  </div>
                  
                  {isRecording ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-[8px] text-red-400 font-extrabold uppercase tracking-widest leading-none">REC</span>
                    </div>
                  ) : (
                    <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">
                      IDLE
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Video Library Section */}
            <div className="w-80 border-l border-white/10 bg-slate-950/40 p-6 flex flex-col space-y-5">
              
              {/* Media Preview Box */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Media Playback Preview</h3>
                <div className="h-44 bg-slate-950 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center relative">
                  {recordedVideoUrl ? (
                    <video 
                      src={recordedVideoUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 opacity-45">
                      <Disc size={28} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-[10px] font-mono text-slate-300">No unsaved video to preview</p>
                    </div>
                  )}
                </div>

                {/* Save recorded video buttons */}
                {recordedVideoUrl && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={saveRecordedVideo}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-blue-600/20"
                    >
                      <Save size={11} />
                      <span>Save inside OS</span>
                    </button>
                    <a
                      href={recordedVideoUrl}
                      download={`recorded_video_${new Date().getTime()}.webm`}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-white/5"
                    >
                      <Download size={11} />
                      <span>Download Local</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Recorded Videos List (From system filesystem) */}
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-white/5 pb-1">
                  <span>Recorded Videos</span>
                  <span className="font-mono text-slate-500 font-normal">({savedVideos.length})</span>
                </h3>

                {savedVideos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 text-center opacity-40">
                    <Video size={24} className="mb-2" />
                    <p className="text-[9px] font-mono leading-relaxed">Recorded videos will be stored in Documents/Videos</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {savedVideos.map((video, index) => (
                      <div 
                        key={index}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold truncate text-slate-300 max-w-[150px]">{video.name}</span>
                          <span className="text-[8px] font-mono text-slate-500">{video.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              setRecordedVideoUrl(video.url);
                              addNotification('VideoStudio', `Loaded ${video.name} to preview`, 'info');
                            }}
                            className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[8px] font-bold uppercase rounded-lg cursor-pointer"
                          >
                            Preview
                          </button>
                          <a
                            href={video.url}
                            download={video.name}
                            className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Download locally"
                          >
                            <Download size={12} />
                          </a>
                          <button
                            onClick={() => {
                              try {
                                fsLib.delete(`Documents/Videos/${video.name}`);
                                setSavedVideos(prev => prev.filter(v => v.name !== video.name));
                                if (recordedVideoUrl === video.url) {
                                  setRecordedVideoUrl(null);
                                }
                                addNotification('VideoStudio', `Deleted ${video.name}`, 'warning');
                              } catch (e) {
                                addNotification('VideoStudio', 'Could not delete file', 'error');
                              }
                            }}
                            className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- SIMULATED VIDEO CHAT / CALLS TAB --- */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Contacts Panel */}
            <div className="w-80 border-r border-white/10 bg-slate-950/20 p-6 flex flex-col space-y-4">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available Contacts</h3>
                <p className="text-[9px] text-slate-500">Secure Peer-to-Peer XMPP VoIP Protocol</p>
              </div>

              {/* Contact list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {CONTACTS.map(contact => (
                  <button
                    key={contact.id}
                    disabled={callState !== 'idle'}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between border text-left transition-all ${selectedContact.id === contact.id ? 'bg-blue-600/15 border-blue-500/30' : 'bg-slate-900/40 border-white/5 hover:border-white/10'} ${callState !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full ${contact.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/30`}>
                          {contact.name.charAt(0)}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#080d19] ${contact.status === 'online' ? 'bg-emerald-500' : contact.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{contact.name}</h4>
                        <p className="text-[9px] text-slate-400">{contact.role}</p>
                      </div>
                    </div>
                    {contact.status === 'online' && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Ready</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Call Controls Box */}
              <div className="pt-2">
                {callState === 'idle' ? (
                  <button
                    onClick={startVideoCall}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95"
                  >
                    <Phone size={14} />
                    <span>Call {selectedContact.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <button
                    onClick={endVideoCall}
                    className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30 active:scale-95 animate-pulse"
                  >
                    <PhoneOff size={14} />
                    <span>Hang Up Stream</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Video Chat Call Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {callState === 'idle' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/10">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 animate-pulse">
                    <Video size={36} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">No Active Video Connection</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                    Select a secure network node contact on the left panel and click "Call" to establish a simulated peer-to-peer audio-video chat session.
                  </p>
                  <div className="flex items-center gap-3 mt-5 px-4 py-2 bg-slate-900 border border-white/5 rounded-2xl text-[10px] text-slate-400 font-mono">
                    <AlertCircle size={12} className="text-amber-400" />
                    <span>Uses full frame loopback for visual feedback simulation</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex overflow-hidden">
                  
                  {/* Call Video Screen Split */}
                  <div className="flex-1 flex flex-col p-6 space-y-4">
                    <div className="flex-1 grid grid-rows-2 gap-4">
                      
                      {/* REMOTE PEER STREAM SCREEN */}
                      <div className="relative bg-slate-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        
                        {/* Interactive audio responsive vector mesh for remote peer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-950 to-slate-950 flex items-center justify-center overflow-hidden">
                          
                          {/* Pulsing graphics */}
                          <div className="relative flex flex-col items-center space-y-4 z-10">
                            <motion.div 
                              animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 180, 270, 360] }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              className="w-20 h-20 rounded-full border border-blue-500/30 flex items-center justify-center relative bg-blue-500/5 shadow-2xl"
                            >
                              <div className="absolute inset-2 rounded-full border border-dashed border-blue-400/40" />
                              <User size={30} className="text-blue-400 animate-pulse" />
                            </motion.div>
                            
                            <div className="text-center">
                              <h3 className="text-sm font-bold tracking-wide text-slate-200 flex items-center gap-2 justify-center">
                                {selectedContact.name}
                                <span id="remote-indicator-pulse" className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse transition-all duration-300" />
                              </h3>
                              <p className="text-[10px] font-mono text-blue-400 tracking-wider uppercase mt-1">ENCRYPTED VoIP LOOP // SECURE PROTOCOL</p>
                            </div>
                          </div>

                          {/* Sound wave visualizer ribbons */}
                          {callState === 'connected' && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12 w-48 pointer-events-none">
                              {[...Array(14)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ height: [12, Math.random() * 40 + 10, 12] }}
                                  transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }}
                                  className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Top Banner Indicators */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono border border-white/10">
                          <span className="text-slate-400 uppercase">PEER: {callState.toUpperCase()}</span>
                        </div>
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-bold font-mono text-white border border-blue-400/30 shadow">
                          <span>CALLING TIME: {formatTime(callDuration)}</span>
                        </div>

                        {/* Speech Caption Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/65 backdrop-blur-md border border-white/10 p-3 rounded-xl text-xs flex gap-2 items-start shadow-xl z-20">
                          <span className="font-bold text-blue-400 whitespace-nowrap">{selectedContact.name.split(' ')[0]}:</span>
                          <span className="text-slate-200 leading-relaxed italic">"{remoteSpeechText}"</span>
                        </div>
                      </div>

                      {/* LOCAL STREAM SCREEN */}
                      <div className="relative bg-slate-950 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center group">
                        {stream && isVideoEnabled ? (
                          <video 
                            ref={callVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center py-4 opacity-50 space-y-2">
                            <VideoOff size={24} className="mx-auto" />
                            <p className="text-[10px] font-mono">Your camera feed is muted</p>
                          </div>
                        )}
                        
                        {/* Overlay tags */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono border border-white/10">
                          <span className="text-slate-400">YOU (LOCAL FEED)</span>
                        </div>

                        {/* Small buttons inside preview */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                          <button 
                            onClick={toggleMic}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${isMicEnabled ? 'text-white' : 'text-red-400'}`}
                            title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
                          >
                            {isMicEnabled ? <Mic size={12} /> : <MicOff size={12} />}
                          </button>
                          <button 
                            onClick={toggleVideo}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${isVideoEnabled ? 'text-white' : 'text-red-400'}`}
                            title={isVideoEnabled ? "Mute Camera" : "Unmute Camera"}
                          >
                            {isVideoEnabled ? <Video size={12} /> : <VideoOff size={12} />}
                          </button>
                          <button 
                            onClick={toggleScreenShare}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${isScreenSharing ? 'text-blue-400' : 'text-white'}`}
                            title="Share Screen"
                          >
                            <Monitor size={12} />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Call Action buttons */}
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={endVideoCall}
                        className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20 active:scale-95"
                      >
                        <PhoneOff size={13} />
                        <span>Hang Up Secure Call</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Chat panel */}
                  <div className="w-80 border-l border-white/10 bg-slate-950/40 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-slate-950/20">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Call Chat Log</h4>
                      <p className="text-[8px] text-slate-500 font-mono">Encrypted end-to-end logs</p>
                    </div>

                    {/* Chat messaging display */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin flex flex-col">
                      {chatMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={`flex flex-col gap-0.5 max-w-[85%] ${msg.sender === 'You' ? 'ml-auto items-end' : msg.sender === 'System' ? 'mx-auto text-center items-center opacity-40' : 'items-start'}`}
                        >
                          {msg.sender !== 'System' && (
                            <span className="text-[9px] font-bold text-slate-500">{msg.sender}</span>
                          )}
                          <div className={`p-2.5 text-xs rounded-2xl ${msg.sender === 'You' ? 'bg-blue-600 text-white rounded-tr-none' : msg.sender === 'System' ? 'bg-transparent text-[9px] text-slate-400 p-0 italic' : 'bg-white/10 text-slate-200 rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                          {msg.sender !== 'System' && (
                            <span className="text-[7px] text-slate-500 font-mono mt-0.5">{msg.time}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Chat input box */}
                    <div className="p-4 border-t border-white/10 bg-slate-950/20 flex gap-2">
                      <input 
                        type="text"
                        placeholder="Type text, press Send..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                        disabled={callState !== 'connected'}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500"
                      />
                      <button 
                        onClick={sendChatMessage}
                        disabled={callState !== 'connected' || !chatInput.trim()}
                        className="px-3 bg-blue-600 hover:bg-blue-500 text-white border-transparent rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>

                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
