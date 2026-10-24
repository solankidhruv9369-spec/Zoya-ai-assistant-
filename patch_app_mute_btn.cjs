const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `        {/* Real-time State Badge & Install Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}`;

const replacement = `        {/* Real-time State Badge & Install Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors \${isMuted ? 'bg-red-900/50 hover:bg-red-900 text-red-400' : 'bg-neutral-800 hover:bg-neutral-700 text-green-400'}\`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? 'Muted' : 'Audio On'}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
