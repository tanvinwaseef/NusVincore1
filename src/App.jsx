import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Calendar, Image as ImageIcon, Send, Music, Scroll, MessageCircle, User, Ruler, GraduationCap, Cake, Camera, AlertTriangle, LogOut, Reply, Trash2, Edit2, X, Check, ArrowLeft, Phone, Video, PhoneIncoming, ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Disc, Headphones, Plus, Repeat, ImagePlus, Link as LinkIcon, Repeat1 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, setDoc, query, orderBy } from 'firebase/firestore';

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDZAzllhZxQzNg63LBU44Ni_S83Z5R_6h8",
  authDomain: "nusvincore.firebaseapp.com",
  projectId: "nusvincore",
  storageBucket: "nusvincore.firebasestorage.app",
  messagingSenderId: "296006095052",
  appId: "1:296006095052:web:b89ad939130d7e3a89b269",
  measurementId: "G-2V4KD2Y2D6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. THEMES & CONFIG ---
const THEMES = {
  tanvin: {
    id: 'tanvin',
    bgGradient: 'from-[#020617] via-[#0f172a] to-[#172554]', 
    text: 'text-blue-50',
    textAccent: 'text-blue-300',
    // Updated Glass Card: Lighter, more blur, white border
    glassCard: 'bg-blue-900/20 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
    input: 'bg-blue-950/60 text-blue-100 border border-white/10',
    heartBtn: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-white/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] backdrop-blur-md',
    button: 'bg-blue-600/90 text-white shadow-lg border border-white/20 backdrop-blur-sm',
    navBar: 'bg-[#020617]/70 border-t border-white/10',
    navIcon: 'text-blue-100/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]',
    chatBubbleMe: 'bg-blue-600/90 text-white shadow-md backdrop-blur-sm border border-white/10',
    chatBubbleThem: 'bg-slate-800/60 text-blue-100 border border-white/10 backdrop-blur-sm',
    orb1: 'bg-blue-600/10', 
    orb2: 'bg-cyan-900/10'
  },
  nusra: {
    id: 'nusra',
    bgGradient: 'from-[#1a050d] via-[#2e0818] to-[#500724]',
    text: 'text-pink-50',
    textAccent: 'text-pink-300',
    glassCard: 'bg-pink-900/20 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
    input: 'bg-pink-950/60 text-pink-100 border border-white/10',
    heartBtn: 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-white/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] backdrop-blur-md',
    button: 'bg-pink-600/90 text-white shadow-lg border border-white/20 backdrop-blur-sm',
    navBar: 'bg-[#1a050d]/70 border-t border-white/10',
    navIcon: 'text-pink-100/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]',
    chatBubbleMe: 'bg-pink-600/90 text-white shadow-md backdrop-blur-sm border border-white/10',
    chatBubbleThem: 'bg-gray-900/60 text-pink-100 border border-white/10 backdrop-blur-sm',
    orb1: 'bg-pink-900/10',
    orb2: 'bg-purple-900/10'
  }
};

const CONFIG = {
  startDate: "2024-10-24T00:00:00", 
  profiles: {
    her: { id: "nusra", name: "Nusra", fullName: "Maisha Tabassum Nusra", age: "14", bday: "Apr 2", height: "5'2", class: "Class 8", defaultImage: "nusra.jpg" },
    me: { id: "tanvin", name: "Tanvin", fullName: "Tanvin Waseef", age: "16", bday: "Oct 14", height: "5'9", class: "Class 9", defaultImage: "tanvin.jpg" }
  },
  playlist: [
    { id: "1", title: "Perfect", artist: "Ed Sheeran", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "bg-blue-500" },
    { id: "2", title: "Tum Hi Ho", artist: "Arijit Singh", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover: "bg-pink-500" }
  ]
};

// --- HELPERS ---
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};

// --- COMPONENTS ---

const SetupRequiredScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen w-full max-w-[56.25vh] mx-auto bg-black text-white p-8 text-center aspect-[9/16]">
    <AlertTriangle size={48} className="text-yellow-500 mb-4" />
    <h2 className="text-xl font-bold mb-4">One Last Step!</h2>
    <p className="text-sm text-gray-300 mb-6">Enable "Anonymous Auth" in Firebase Console.</p>
  </div>
);

const CallOverlay = ({ isActive, type, partnerName, onEnd, theme }) => {
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      <div className={`w-32 h-32 rounded-full ${theme.glassCard} flex items-center justify-center mb-8 animate-pulse ring-1 ring-white/20`}>
        {type === 'video' ? <Video size={56} className={theme.text} /> : <Phone size={56} className={theme.text} />}
      </div>
      <h2 className={`text-3xl font-bold ${theme.text} mb-2 tracking-tight`}>{partnerName}</h2>
      <p className={`${theme.text} opacity-60 mb-16 text-lg font-medium`}>{type === 'video' ? 'Video Calling...' : 'Calling...'}</p>
      <button onClick={onEnd} className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl active:scale-90 transition-transform hover:bg-red-600 border-4 border-white/20">
        <PhoneIncoming size={32} className="text-white rotate-[135deg]" />
      </button>
    </div>
  );
};

const PhotoUploader = ({ currentImage, onImageUpload, id }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageUpload(imageUrl);
      localStorage.setItem(`love_capsule_photo_${id}`, imageUrl);
    }
  };
  return (
    <div onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-full overflow-hidden relative cursor-pointer group shrink-0 bg-white/10 border border-white/30">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <img src={currentImage} alt="Profile" className="w-full h-full object-cover object-center" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity ${currentImage ? 'hidden' : 'flex'}`}>
         <Camera size={16} className="text-white/80" />
      </div>
    </div>
  );
};

const ModernGallery = ({ theme }) => {
  const [memories, setMemories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
      const q = query(collection(db, 'memories'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const mems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (mems.length > 0) setMemories(mems);
          else setMemories([{ id: 'default', title: "Add your first memory", date: "Tap + to add", color: "bg-blue-900" }]);
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && memories.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % memories.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, memories.length]);

  const handleSwipe = () => {
    if (touchStart.current - touchEnd.current > 50) setCurrentIndex((prev) => (prev + 1) % memories.length);
    if (touchStart.current - touchEnd.current < -50) setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const handleAddMemory = async (e) => {
      e.preventDefault();
      if (!newTitle || !newDate) return;
      try {
          await addDoc(collection(db, 'memories'), {
              title: newTitle,
              date: newDate,
              image: newImageUrl, 
              color: `bg-${Math.random() > 0.5 ? 'blue' : 'pink'}-600`,
              createdAt: serverTimestamp()
          });
          setNewTitle(""); setNewDate(""); setNewImageUrl(""); setShowAddModal(false);
      } catch (err) { console.error(err); }
  };

  const handleDeleteMemory = async () => {
      if (window.confirm("Delete this memory?")) {
          try { await deleteDoc(doc(db, 'memories', memories[currentIndex].id)); } catch(e) {}
      }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      <div 
        className={`relative w-full aspect-[4/5] ${theme.glassCard} rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 ring-1 ring-white/10`}
        onTouchStart={(e) => touchStart.current = e.targetTouches[0].clientX}
        onTouchMove={(e) => touchEnd.current = e.targetTouches[0].clientX}
        onTouchEnd={handleSwipe}
      >
        {memories[currentIndex]?.image ? (
             <img src={memories[currentIndex].image} alt="Memory" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
            <div className={`absolute inset-0 ${memories[currentIndex]?.color || 'bg-gray-800'} flex items-center justify-center transition-colors duration-500`}>
                <ImageIcon className="text-white/40 w-32 h-32" />
            </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-24 backdrop-blur-[2px]">
          <h3 className="text-2xl font-bold text-white mb-1 tracking-wide">{memories[currentIndex]?.title}</h3>
          <p className={`text-sm ${theme.text} opacity-80 font-medium`}>{memories[currentIndex]?.date}</p>
        </div>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
            {memories[currentIndex]?.id !== 'default' && (
                 <button onClick={handleDeleteMemory} className="p-2 rounded-full bg-black/40 backdrop-blur-md text-red-400 hover:bg-black/60 transition border border-white/10">
                    <Trash2 size={16} />
                 </button>
            )}
           <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition border border-white/10`}>
             {isPlaying ? <Pause size={16} /> : <Play size={16} />}
           </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
         <h3 className={`text-xs font-bold ${theme.text} opacity-70 uppercase tracking-wider`}>Timeline</h3>
         <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 text-xs bg-white/10 px-3 py-1.5 rounded-full text-white hover:bg-white/20 transition border border-white/5">
             <Plus size={12} /> Add Memory
         </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 snap-x">
          {memories.map((mem, idx) => (
            <button 
              key={mem.id} 
              onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 snap-start border border-white/10 ${idx === currentIndex ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-60 scale-95'}`}
            >
              {mem.image ? (
                  <img src={mem.image} className="w-full h-full object-cover" />
              ) : (
                  <div className={`w-full h-full ${mem.color} flex items-center justify-center`}>
                     <ImageIcon size={14} className="text-white/50" />
                  </div>
              )}
            </button>
          ))}
      </div>

      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className={`bg-black/40 backdrop-blur-2xl border border-white/20 p-6 rounded-[2rem] w-full max-w-sm shadow-2xl`}>
                <h3 className="text-xl font-bold text-white mb-4">Add Memory</h3>
                <form onSubmit={handleAddMemory} className="flex flex-col gap-4">
                    <input type="text" placeholder="Title" value={newTitle} onChange={e=>setNewTitle(e.target.value)} className={`p-3.5 rounded-xl ${theme.input} text-sm bg-white/5 outline-none focus:bg-white/10 transition`} required />
                    <input type="text" placeholder="Date" value={newDate} onChange={e=>setNewDate(e.target.value)} className={`p-3.5 rounded-xl ${theme.input} text-sm bg-white/5 outline-none focus:bg-white/10 transition`} required />
                    <input type="url" placeholder="Image URL (Drive/Dropbox)" value={newImageUrl} onChange={e=>setNewImageUrl(e.target.value)} className={`p-3.5 rounded-xl ${theme.input} text-sm bg-white/5 outline-none focus:bg-white/10 transition`} />
                    
                    <div className="flex gap-3 mt-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-3 rounded-xl bg-white/5 text-white/70 text-sm hover:bg-white/10 transition border border-white/5">Cancel</button>
                        <button type="submit" className={`flex-1 p-3 rounded-xl ${theme.button} text-sm`}>Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

// --- MUSIC PLAYER COMPONENT ---
const MusicPlayer = ({ theme, identity, partnerName, globalAudio, globalSetSong, globalSetPlaying, globalSong, globalIsPlaying, globalIsRepeating, globalSetRepeating }) => {
  const [partnerActivity, setPartnerActivity] = useState(null);
  const [songs, setSongs] = useState([...CONFIG.playlist]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongArtist, setNewSongArtist] = useState("");
  const [newSongUrl, setNewSongUrl] = useState("");
  const [newSongCover, setNewSongCover] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const coverFileRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'user_songs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs([...CONFIG.playlist, ...userSongs]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const partnerId = identity === 'tanvin' ? 'nusra' : 'tanvin';
    const unsubscribe = onSnapshot(doc(db, 'music', partnerId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.isPlaying && Date.now() - data.lastUpdated?.toMillis() < 60000) {
           setPartnerActivity(data);
        } else {
           setPartnerActivity(null);
        }
      }
    });
    return () => unsubscribe();
  }, [identity]);

  useEffect(() => {
    if (globalSong) {
        setDoc(doc(db, 'music', identity), {
            songId: globalSong.id,
            title: globalSong.title,
            artist: globalSong.artist,
            isPlaying: globalIsPlaying,
            lastUpdated: serverTimestamp()
        });
    }
  }, [globalSong, globalIsPlaying, identity]);

  // UI Progress Updater
  useEffect(() => {
    const audio = globalAudio.current;
    const updateProgress = () => {
        setDuration(audio.duration || 0);
        setProgress(audio.currentTime);
    };
    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [globalAudio]);

  const playSong = (song) => {
    if (globalSong?.id === song.id) globalSetPlaying(!globalIsPlaying);
    else { globalSetSong(song); globalSetPlaying(true); }
  };

  const playNext = () => {
      if(!globalSong) return;
      const currentIndex = songs.findIndex(s => s.id === globalSong.id);
      const nextIndex = (currentIndex + 1) % songs.length;
      playSong(songs[nextIndex]);
  };

  const playPrev = () => {
      if(!globalSong) return;
      const currentIndex = songs.findIndex(s => s.id === globalSong.id);
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      playSong(songs[prevIndex]);
  };

  const handleSeek = (e) => {
      const newTime = parseFloat(e.target.value);
      globalAudio.current.currentTime = newTime;
      setProgress(newTime);
  };

  const syncWithPartner = () => {
      if (partnerActivity) {
          const song = songs.find(s => s.id === partnerActivity.songId);
          if (song) { globalSetSong(song); globalSetPlaying(true); }
      }
  };

  const handleDeleteSong = async (songId, e) => {
      e.stopPropagation();
      if (window.confirm("Delete this song?")) {
          try { await deleteDoc(doc(db, 'user_songs', songId)); } catch(e) {}
      }
  };

  const handleAddSong = async (e) => {
      e.preventDefault();
      if (!newSongTitle || !newSongArtist || !newSongUrl) return;
      try {
          await addDoc(collection(db, 'user_songs'), {
              title: newSongTitle,
              artist: newSongArtist,
              url: newSongUrl,
              coverImage: newSongCover, 
              createdAt: serverTimestamp(),
              cover: `bg-${Math.random() > 0.5 ? 'blue' : 'pink'}-500` 
          });
          setNewSongTitle(""); setNewSongArtist(""); setNewSongUrl(""); setNewSongCover(null); setShowAddModal(false);
      } catch (err) { console.error("Add song failed", err); }
  };

  const handleCoverPick = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
          const base64 = await compressImage(file);
          setNewSongCover(base64);
      } catch(err) {}
  }

  const formatTime = (time) => {
      if (isNaN(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-fade-in relative">
        {partnerActivity && partnerActivity.isPlaying && (
            <div className={`mx-4 mt-4 mb-2 p-3 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-between backdrop-blur-md animate-pulse`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <Headphones size={20} className="text-pink-300 shrink-0" />
                    <div className="truncate">
                        <p className="text-xs text-white/90 font-bold truncate">{partnerName} is listening...</p>
                        <p className="text-[10px] text-white/60 truncate">{partnerActivity.title}</p>
                    </div>
                </div>
                <button onClick={syncWithPartner} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/10 transition-colors shrink-0">
                    Join
                </button>
            </div>
        )}

        <div className={`mx-6 my-6 aspect-square ${theme.glassCard} rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl ring-1 ring-white/10`}>
            {globalSong ? (
                <>
                    {globalSong.coverImage ? (
                         <img src={globalSong.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl" />
                    ) : (
                        <div className={`absolute inset-0 ${globalSong.cover} opacity-20 blur-2xl`}></div>
                    )}
                    
                    <div className={`w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center shadow-2xl overflow-hidden ${globalIsPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                         {globalSong.coverImage ? (
                             <img src={globalSong.coverImage} className="w-full h-full object-cover" />
                         ) : (
                            <Disc size={80} className="text-white/50" />
                         )}
                    </div>
                    <div className="mt-6 text-center z-10 px-6 w-full">
                        <h2 className="text-2xl font-bold text-white mb-1 truncate">{globalSong.title}</h2>
                        <p className={`text-sm ${theme.text} opacity-70 truncate`}>{globalSong.artist}</p>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center text-white/40">
                    <Music size={48} className="mb-4" />
                    <p className="text-sm">Select a song</p>
                </div>
            )}
        </div>

        <div className="px-8 flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-2">
                <input type="range" min="0" max={duration || 0} value={progress} onChange={handleSeek} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
                <div className="flex justify-between text-[10px] text-white/50 font-medium">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between px-4 mt-2">
                <button onClick={playPrev} className={`text-white/60 hover:text-white transition active:scale-90`}><SkipBack size={28} /></button>
                <button onClick={() => globalSetPlaying(!globalIsPlaying)} className={`w-16 h-16 rounded-full flex items-center justify-center bg-white text-black shadow-xl active:scale-95 transition-all hover:scale-105`}>
                    {globalIsPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={playNext} className={`text-white/60 hover:text-white transition active:scale-90`}><SkipForward size={28} /></button>
            </div>
            
            <div className="flex justify-center">
                 <button onClick={() => globalSetRepeating(!globalIsRepeating)} className={`p-2 rounded-full transition ${globalIsRepeating ? 'bg-white/20 text-white' : 'text-white/40'}`}>
                     <Repeat1 size={18} />
                 </button>
            </div>
        </div>

        <div className="px-6 flex items-center justify-between mb-3">
            <h3 className={`text-xs font-bold ${theme.text} uppercase tracking-wider opacity-60`}>Library</h3>
            <button onClick={() => setShowAddModal(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/5"><Plus size={16} className="text-white" /></button>
        </div>
        
        <div className="px-6 flex flex-col gap-3 pb-4">
            {songs.map((song) => (
                <div key={song.id} className={`flex items-center gap-4 p-3 rounded-2xl transition-all group ${globalSong?.id === song.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}>
                    <button onClick={() => playSong(song)} className="flex-1 flex items-center gap-4 text-left min-w-0">
                        <div className={`w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0`}>
                            {song.coverImage ? <img src={song.coverImage} className="w-full h-full object-cover" /> : <Music size={16} className="text-white/50" />}
                        </div>
                        <div className="min-w-0">
                            <h4 className={`text-sm font-bold ${globalSong?.id === song.id ? 'text-white' : theme.text} truncate`}>{song.title}</h4>
                            <p className="text-[10px] text-white/40 truncate">{song.artist}</p>
                        </div>
                    </button>
                    
                    {globalSong?.id === song.id && globalIsPlaying && (
                        <div className="flex gap-0.5 h-3 items-end mr-2">
                            <div className="w-1 bg-green-400 animate-[bounce_1s_infinite] h-full"></div>
                            <div className="w-1 bg-green-400 animate-[bounce_1.2s_infinite] h-2/3"></div>
                        </div>
                    )}
                    {/* Delete Button for Custom Songs */}
                    {typeof song.id === 'string' && song.id.length > 5 && (
                        <button onClick={(e) => handleDeleteSong(song.id, e)} className="p-2 text-white/20 hover:text-red-400 transition">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>

        {/* Add Song Modal - Glassy */}
        {showAddModal && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
                <div className={`bg-black/40 backdrop-blur-2xl border border-white/20 p-6 rounded-[2rem] w-full max-w-sm shadow-2xl`}>
                    <h3 className="text-xl font-bold text-white mb-4">Add New Song</h3>
                    <form onSubmit={handleAddSong} className="flex flex-col gap-4">
                        <input type="text" placeholder="Song Title" value={newSongTitle} onChange={e=>setNewSongTitle(e.target.value)} className={`p-3.5 rounded-xl ${theme.input} text-sm bg-white/5 outline-none focus:bg-white/10 transition`} required />
                        <input type="text" placeholder="Artist Name" value={newSongArtist} onChange={e=>setNewSongArtist(e.target.value)} className={`p-3.5 rounded-xl ${theme.input} text-sm bg-white/5 outline-none focus:bg-white/10 transition`} required />
                        <input type="url" placeholder="MP3 Direct Link (Dropbox/GitHub/etc)" value={newSongUrl} onChange={e=>setNewSongUrl(e.target.value)} className={`p-3.5 rounded-xl ${theme.input} text-sm bg-white/5 outline-none focus:bg-white/10 transition`} required />
                        
                        <div onClick={() => coverFileRef.current?.click()} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 cursor-pointer hover:bg-white/10 transition h-16 relative overflow-hidden">
                            {newSongCover ? <img src={newSongCover} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <ImagePlus size={18} />}
                            <span className="relative z-10">{newSongCover ? "Change Cover" : "Add Cover Art"}</span>
                            <input type="file" ref={coverFileRef} onChange={handleCoverPick} className="hidden" accept="image/*" />
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-3 rounded-xl bg-white/5 text-white/70 text-sm hover:bg-white/10 transition border border-white/5">Cancel</button>
                            <button type="submit" className={`flex-1 p-3 rounded-xl ${theme.button} text-sm`}>Save Song</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

const IdentitySelector = ({ onSelect, profileImages, updateImage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full max-w-[56.25vh] mx-auto bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#312e81] text-white p-6 relative overflow-hidden aspect-[9/16]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/30 to-black/80 pointer-events-none"></div>
      <h1 className="text-3xl font-bold mb-10 z-10 text-center text-white drop-shadow-lg tracking-tight">Who are you?</h1>
      <div className="flex flex-col gap-6 w-full max-w-xs z-10">
        {['me', 'her'].map((key) => {
          const profile = CONFIG.profiles[key];
          const theme = THEMES[profile.id];
          const buttonStyle = profile.id === 'tanvin' ? 'bg-blue-900/20 border-blue-500/20 hover:bg-blue-900/40' : 'bg-pink-900/20 border-pink-500/20 hover:bg-pink-900/40';
          return (
            <div key={key} className={`${buttonStyle} backdrop-blur-xl border p-4 rounded-[2rem] flex items-center gap-5 transition-all duration-300 active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.3)] group`}>
              <div onClick={(e) => e.stopPropagation()}>
                <PhotoUploader id={profile.id} currentImage={profileImages[profile.id]} onImageUpload={(url) => updateImage(profile.id, url)} />
              </div>
              <button onClick={() => onSelect(profile.id)} className="flex-1 text-left h-full flex flex-col justify-center">
                <h3 className={`font-bold text-2xl ${theme.text} group-hover:text-white transition-colors`}>{profile.name}</h3>
                <p className={`text-[11px] ${theme.text} opacity-60 tracking-widest uppercase`}>Tap to Enter</p>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const FloatingHeart = ({ id, color, removeHeart }) => {
  const [style] = useState(() => ({ left: `${Math.random() * 80 + 10}%`, animationDuration: `${3 + Math.random() * 2}s` }));
  useEffect(() => { const timer = setTimeout(() => removeHeart(id), 4000); return () => clearTimeout(timer); }, [id, removeHeart]);
  return (
    <div className={`absolute bottom-0 ${color} pointer-events-none animate-float z-50`} style={style}>
      <Heart fill="currentColor" size={24 + Math.random() * 24} />
    </div>
  );
};

const RelationshipTimer = ({ theme }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const updateTime = () => {
      const diff = new Date().getTime() - new Date(CONFIG.startDate).getTime();
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    const timer = setInterval(updateTime, 1000);
    updateTime(); return () => clearInterval(timer);
  }, []);
  return (
    <div className={`${theme.glassCard} rounded-[2rem] p-6 mb-6`}>
      <h2 className={`text-sm font-bold ${theme.text} mb-4 flex items-center gap-2 pl-1 opacity-90 tracking-widest uppercase`}>
        <Calendar className={theme.textAccent} size={14} /> Time Together
      </h2>
      <div className="grid grid-cols-4 gap-3 text-center">
        {[{l:'Days',v:time.days}, {l:'Hrs',v:time.hours}, {l:'Mins',v:time.minutes}, {l:'Secs',v:time.seconds}].map((item, i) => (
          <div key={i} className="flex flex-col bg-white/5 rounded-2xl py-3 backdrop-blur-sm border border-white/10">
            <span className={`text-xl font-bold ${theme.textAccent} font-mono drop-shadow-md`}>{item.v}</span>
            <span className={`text-[8px] uppercase tracking-widest ${theme.text} opacity-50 mt-1`}>{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileSection = ({ profileImages, updateImage, theme, partnerStatus }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[CONFIG.profiles.me, CONFIG.profiles.her].map((profile, i) => {
        return (
          <div key={i} className={`${theme.glassCard} rounded-[2rem] p-5 flex flex-col items-center text-center relative overflow-hidden`}>
             <div className="mb-3 relative">
               <PhotoUploader id={profile.id} currentImage={profileImages[profile.id]} onImageUpload={(url) => updateImage(profile.id, url)} />
               {((profile.id === 'nusra' && theme.id === 'tanvin') || (profile.id === 'tanvin' && theme.id === 'nusra')) && (
                 <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-[#0f172a] ${partnerStatus === 'online' ? 'bg-green-400 shadow-[0_0_10px_#22c55e]' : 'bg-gray-500'}`}></div>
               )}
             </div>
             <h3 className={`${theme.text} font-bold text-lg mb-1 tracking-tight`}>{profile.name}</h3>
             <div className={`flex items-center gap-1.5 text-[10px] ${theme.text} opacity-70 bg-white/5 border border-white/10 px-3 py-1 rounded-full shadow-sm`}>
                <Cake size={10}/> <span>{profile.bday}</span>
             </div>
          </div>
        )
      })}
    </div>
  );
};

const ChatFeature = ({ identity, user, theme, partnerStatus, startCall }) => { 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const statusRef = doc(db, 'status', 'connection-test');
    const unsubscribeStatus = onSnapshot(statusRef, () => setIsConnected(true), () => setIsConnected(false));
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => { unsubscribe(); unsubscribeStatus(); };
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !uploading) return;
    const msgToSend = newMessage;
    setNewMessage(""); 
    try {
      await addDoc(collection(db, 'messages'), {
        text: msgToSend,
        senderId: identity,
        senderName: CONFIG.profiles[identity === 'tanvin' ? 'me' : 'her'].name,
        timestamp: Date.now()
      });
    } catch (error) {}
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await compressImage(file);
      await addDoc(collection(db, 'messages'), { image: base64, text: "", senderId: identity, senderName: CONFIG.profiles[identity === 'tanvin' ? 'me' : 'her'].name, timestamp: Date.now() });
    } catch (err) {}
    setUploading(false);
  };
  
  // Simple Delete - Immediate
  const handleDelete = async (id) => {
     try { await deleteDoc(doc(db, 'messages', id)); } catch(e) {}
  };

  return (
    <div className="flex flex-col h-full relative">
      {!isConnected && <div className="absolute top-0 left-0 right-0 bg-red-500/80 text-white text-[10px] text-center py-1 z-50 backdrop-blur-sm">Connecting...</div>}
      <div className={`flex-1 p-4 overflow-y-auto flex flex-col gap-4 scrollbar-hide`}>
        {messages.length === 0 && <div className={`flex-1 flex items-center justify-center ${theme.text} opacity-30 text-sm font-medium italic`}>Start a conversation...</div>}
        {messages.map((msg) => {
          const isMe = msg.senderId === identity;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end self-end' : 'items-start self-start'} relative group max-w-[85%] animate-fade-in-up`}>
              <div className={`px-4 py-3 rounded-[1.5rem] text-sm transition-all duration-200 ${isMe ? theme.chatBubbleMe : theme.chatBubbleThem} ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} w-fit break-all whitespace-pre-wrap shadow-lg`}>
                {msg.image ? <img src={msg.image} alt="Shared" className="rounded-xl max-w-full max-h-[200px] object-cover" /> : <p className="leading-relaxed tracking-wide">{msg.text}</p>}
              </div>
               {isMe && (
                   <button onClick={() => handleDelete(msg.id)} className="text-[9px] text-red-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Unsend</button>
               )}
              <span className={`text-[9px] ${theme.text} opacity-40 mt-1 px-2 font-medium tracking-wider`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className={`flex gap-3 items-center p-2.5 m-3 rounded-[2.5rem] ${theme.input} shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-20 backdrop-blur-xl border border-white/10`}>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-90 ${uploading ? 'animate-pulse' : ''}`}><Camera size={20} /></button>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent text-sm focus:outline-none text-white/90 placeholder-white/40 min-w-0 px-2 font-medium" />
        <button type="submit" className={`p-3 rounded-full ${theme.button} shadow-lg shrink-0 active:scale-90 transition-all hover:brightness-110`}><Send size={20} /></button>
      </form>
    </div>
  );
};

export default function App() {
  const [identity, setIdentity] = useState(null); 
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [hearts, setHearts] = useState([]);
  const [authError, setAuthError] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState('offline'); 
  const [profileImages, setProfileImages] = useState({ tanvin: CONFIG.profiles.me.defaultImage, nusra: CONFIG.profiles.her.defaultImage });
  const [calling, setCalling] = useState(false);
  const [callType, setCallType] = useState('audio');
  const [globalSong, setGlobalSong] = useState(null);
  const [globalIsPlaying, setGlobalIsPlaying] = useState(false);
  const [globalIsRepeating, setGlobalIsRepeating] = useState(false);
  const globalAudio = useRef(new Audio());
  
  // Audio Lifecycle Management at APP LEVEL
  useEffect(() => {
      const audio = globalAudio.current;
      if (globalSong) {
          if (audio.src !== globalSong.url) audio.src = globalSong.url;
          if (globalIsPlaying) {
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      if (error.name !== 'AbortError') setGlobalIsPlaying(false);
                  });
              }
          } else {
              audio.pause();
          }
      } else {
          audio.pause();
      }
  }, [globalSong, globalIsPlaying]);

  useEffect(() => { const initAuth = async () => { try { await signInAnonymously(auth); } catch (error) { if (error.code === 'auth/configuration-not-found') setAuthError(true); } }; initAuth(); return onAuthStateChanged(auth, (u) => setUser(u)); }, []);
  useEffect(() => { const savedId = localStorage.getItem('love_capsule_identity'); if (savedId) setIdentity(savedId); setProfileImages(prev => ({ tanvin: localStorage.getItem('love_capsule_photo_tanvin') || prev.tanvin, nusra: localStorage.getItem('love_capsule_photo_nusra') || prev.nusra })); }, []);
  
  // Presence & Update Status for Music
  useEffect(() => { 
      if (!identity || !user) return; 
      const updateMyStatus = async () => { 
          try { 
              // Update status AND Music info here to keep single writer
              await setDoc(doc(db, 'music', identity), { 
                 lastSeen: serverTimestamp(),
                 isPlaying: globalIsPlaying,
                 songId: globalSong?.id || null,
                 title: globalSong?.title || null
              }, { merge: true });

              // Also legacy status doc if needed
               await setDoc(doc(db, 'status', identity), { lastSeen: serverTimestamp() });
          } catch (e) {} 
      }; 
      updateMyStatus(); 
      const interval = setInterval(updateMyStatus, 10000); 
      
      const partnerId = identity === 'tanvin' ? 'nusra' : 'tanvin'; 
      const unsubscribe = onSnapshot(doc(db, 'status', partnerId), (doc) => { if (doc.exists()) { const data = doc.data(); const lastSeen = data.lastSeen?.toMillis ? data.lastSeen.toMillis() : 0; setPartnerStatus(Date.now() - lastSeen < 15000 ? 'online' : 'offline'); } }); 
      return () => { clearInterval(interval); unsubscribe(); }; 
  }, [identity, user, globalIsPlaying, globalSong]);

  const handleIdentitySelect = (id) => { setIdentity(id); localStorage.setItem('love_capsule_identity', id); };
  const handleLogout = () => { 
      setIdentity(null); 
      localStorage.removeItem('love_capsule_identity');
      setGlobalSong(null);
      setGlobalIsPlaying(false);
      globalAudio.current.pause();
  };
  const updateProfileImage = (id, url) => { setProfileImages(prev => ({ ...prev, [id]: url })); };
  useEffect(() => { if (!user || !identity) return; const unsubscribe = onSnapshot(collection(db, 'signals'), (snapshot) => { snapshot.docChanges().forEach((change) => { if (change.type === "added") { const data = change.doc.data(); if (data.timestamp > Date.now() - 5000 && data.senderId !== identity) { const heartColor = data.senderId === 'tanvin' ? 'text-blue-500' : 'text-pink-500'; spawnMultipleHearts(heartColor); } } }); }); return () => unsubscribe(); }, [user, identity]);
  const sendRemoteHeart = async () => { const theme = THEMES[identity]; spawnHeart(theme.heartColor); if (!user || !identity) return; try { await addDoc(collection(db, 'signals'), { type: 'heart', senderId: identity, timestamp: Date.now() }); } catch (e) {} };
  const startCall = (type) => { setCallType(type); setCalling(true); };
  useEffect(() => { const styleSheet = document.createElement("style"); styleSheet.innerText = ` @keyframes float { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translateY(-100vh) scale(1.2); opacity: 0; } } .animate-float { animation-name: float; animation-timing-function: ease-in; } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } `; document.head.appendChild(styleSheet); return () => document.head.removeChild(styleSheet); }, []);
  const removeHeart = useCallback((id) => { setHearts(h => h.filter(heart => heart.id !== id)); }, []);
  const spawnHeart = useCallback((colorClass) => { setHearts(h => [...h, { id: `${Date.now()}-${Math.random()}`, color: colorClass }]); }, []);
  const spawnMultipleHearts = useCallback((color) => { let c=0; const i = setInterval(() => { spawnHeart(color); c++; if(c>8) clearInterval(i); }, 200); }, [spawnHeart]);

  if (authError) return <SetupRequiredScreen />;
  if (!identity) return <IdentitySelector onSelect={handleIdentitySelect} profileImages={profileImages} updateImage={updateProfileImage} />;
  const theme = THEMES[identity];
  const myProfile = CONFIG.profiles[identity === 'tanvin' ? 'me' : 'her'];
  const partnerProfile = CONFIG.profiles[identity === 'tanvin' ? 'her' : 'me'];

  return (
    <div className={`h-screen w-full max-w-[56.25vh] mx-auto bg-gradient-to-b ${theme.bgGradient} flex flex-col relative overflow-hidden shadow-2xl font-sans border-x-0 aspect-[9/16]`}>
      {/* STABLE Background - No Animation */}
      <div className={`fixed top-[-10%] left-[-10%] w-[600px] h-[600px] ${theme.orb1} rounded-full blur-[150px] pointer-events-none`}></div>
      <div className={`fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] ${theme.orb2} rounded-full blur-[150px] pointer-events-none`}></div>

      <CallOverlay isActive={calling} type={callType} partnerName={partnerProfile.name} onEnd={() => setCalling(false)} theme={theme} />

      <header className="px-5 py-4 z-10 flex justify-between items-center bg-transparent relative">
        {activeTab === 'messages' ? (
          <div className="flex items-center gap-3 w-full animate-fade-in">
            <button onClick={() => setActiveTab('home')} className={`p-2.5 rounded-full ${theme.glassCard} ${theme.text} hover:bg-white/10 transition-all active:scale-90 shadow-lg`}><ArrowLeft size={20} /></button>
            <div className={`w-10 h-10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden border ${theme.id === 'tanvin' ? 'border-pink-400/30' : 'border-blue-400/30'}`}>
               <img src={profileImages[partnerProfile.id]} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'} />
            </div>
            <div className="flex-1">
              <h1 className={`text-lg font-bold ${theme.text} drop-shadow-md tracking-wide`}>{partnerProfile.name}</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${partnerStatus === 'online' ? 'bg-green-400 shadow-[0_0_10px_#22c55e]' : 'bg-gray-500'}`}></div>
                <p className={`text-[10px] ${theme.text} opacity-60 tracking-wide uppercase font-medium`}>{partnerStatus === 'online' ? 'Online' : 'Offline'}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => startCall('audio')} className={`p-2.5 rounded-full ${theme.glassCard} ${theme.text} hover:bg-white/10 transition-all active:scale-90 shadow-lg`}><Phone size={18} /></button>
               <button onClick={() => startCall('video')} className={`p-2.5 rounded-full ${theme.glassCard} ${theme.text} hover:bg-white/10 transition-all active:scale-90 shadow-lg`}><Video size={18} /></button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full animate-fade-in">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden relative bg-black/30`}>
                  {/* Circular Profile Picture on Glass Card */}
                 <img src={profileImages[myProfile.id]} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'} />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme.text} drop-shadow-lg tracking-tight`}>Hi, {myProfile.name}</h1>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${partnerStatus === 'online' ? 'bg-green-400 shadow-[0_0_10px_#22c55e]' : 'bg-gray-500'}`}></div>
                  <p className={`text-[10px] ${theme.text} opacity-60 tracking-wide uppercase font-bold`}>{partnerStatus === 'online' ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleLogout} className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.glassCard} hover:bg-white/10 transition-all active:scale-90 shadow-lg`}><LogOut size={18} className={theme.text} /></button>
              <button onClick={sendRemoteHeart} className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.heartBtn} transition-all active:scale-90 hover:brightness-110`}><Heart fill="currentColor" size={18} /></button>
            </div>
          </div>
        )}
      </header>

      <main className={`flex-1 px-4 overflow-y-auto z-10 scrollbar-hide ${activeTab === 'messages' ? 'pb-0 px-0' : 'pb-28'}`}>
        {activeTab === 'home' && (
          <div className="animate-fade-in pt-2">
            <ProfileSection profileImages={profileImages} updateImage={updateProfileImage} theme={theme} partnerStatus={partnerStatus} />
            <RelationshipTimer theme={theme} />
          </div>
        )}

        {activeTab === 'gallery' && <div className="animate-fade-in pt-2"><ModernGallery theme={theme} /></div>}

        {activeTab === 'music' && <MusicPlayer theme={theme} identity={identity} partnerName={partnerProfile.name} globalAudio={globalAudio} globalSetSong={setGlobalSong} globalSetPlaying={setGlobalIsPlaying} globalSong={globalSong} globalIsPlaying={globalIsPlaying} globalIsRepeating={globalIsRepeating} globalSetRepeating={setGlobalIsRepeating} />}

        {activeTab === 'messages' && <ChatFeature identity={identity} user={user} theme={theme} startCall={startCall} />}
      </main>

      {hearts.map(h => <FloatingHeart key={h.id} id={h.id} color={h.color} removeHeart={removeHeart} />)}

      {activeTab !== 'messages' && (
        <nav className={`absolute bottom-6 left-6 right-6 h-14 rounded-full ${theme.navBar} backdrop-blur-2xl flex justify-between items-center px-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-20 border border-white/10`}>
          <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Heart} theme={theme} />
          <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon={ImageIcon} theme={theme} />
          <TabButton active={activeTab === 'music'} onClick={() => setActiveTab('music')} icon={Music} theme={theme} />
          <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={MessageCircle} theme={theme} />
        </nav>
      )}
    </div>
  );
}

const TabButton = ({ active, icon: Icon, onClick, theme }) => (
  <button onClick={onClick} className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${active ? `${theme.navIcon} scale-110` : `text-white/40 hover:text-white/70 hover:scale-105`}`}>
    <Icon size={20} fill={active ? "currentColor" : "none"} strokeWidth={active ? 0 : 1.5} />
  </button>
);