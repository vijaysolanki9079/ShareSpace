import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const showIndiaOnlyToast = () => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.8 }}
      className="flex items-center gap-3 bg-emerald-950/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-[0_10px_30px_rgba(6,78,59,0.3)] border border-white/10"
    >
      <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full text-xs shadow-inner">
        🇮🇳
      </div>
      <span className="text-[11px] font-black text-white uppercase tracking-wider">
        India Only
      </span>
      <div className="h-3 w-[1px] bg-white/20 mx-0.5" />
      <button 
        onClick={() => toast.dismiss(t.id)}
        className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest px-1"
      >
        Got it
      </button>
    </motion.div>
  ), { 
    duration: 4000, 
    position: 'top-center' 
  });
};
