const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const stateTarget = `  const [masterVolume, setMasterVolume] = useState<number>(1);`;
const stateReplacement = `  const [masterVolume, setMasterVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);`;

const effectTarget = `  useEffect(() => {
    if (streamerRef.current) {
      streamerRef.current.setVolume(masterVolume);
    }
  }, [masterVolume]);`;
const effectReplacement = `  useEffect(() => {
    if (streamerRef.current) {
      streamerRef.current.setVolume(isMuted ? 0 : masterVolume);
    }
  }, [masterVolume, isMuted]);`;

content = content.replace(stateTarget, stateReplacement);
content = content.replace(effectTarget, effectReplacement);
fs.writeFileSync('src/App.tsx', content);
