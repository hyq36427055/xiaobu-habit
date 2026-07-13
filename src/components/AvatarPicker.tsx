import { useRef, useState, type PointerEvent } from 'react';
import { ImagePlus, RotateCcw, X } from 'lucide-react';

const STORAGE_KEY = 'smallstep-avatar-v1';

export function AvatarPicker({large=false}:{large?:boolean}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [source, setSource] = useState('');
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [error, setError] = useState('');
  const dragRef = useRef<{x:number;y:number;positionX:number;positionY:number}|null>(null);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = {x:event.clientX,y:event.clientY,positionX,positionY};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const dragPhoto = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) return;
    setPositionX(Math.max(0,Math.min(100,start.positionX-(event.clientX-start.x)/2)));
    setPositionY(Math.max(0,Math.min(100,start.positionY-(event.clientY-start.y)/2)));
  };
  const stopDrag = () => { dragRef.current = null; };

  const choosePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('请选择图片文件'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('图片请控制在 10MB 以内'); return; }
    const reader = new FileReader();
    reader.onload = () => { setSource(String(reader.result)); setZoom(1.2); setPositionX(50); setPositionY(50); setError(''); };
    reader.onerror = () => setError('照片读取失败，请重新选择');
    reader.readAsDataURL(file);
  };

  const saveCrop = () => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) return;
      const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
      const sourceX = (image.naturalWidth - cropSize) * positionX / 100;
      const sourceY = (image.naturalHeight - cropSize) * positionY / 100;
      context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 256, 256);
      const cropped = canvas.toDataURL('image/jpeg', .86);
      localStorage.setItem(STORAGE_KEY, cropped);
      setAvatar(cropped); setSource('');
    };
    image.onerror = () => setError('裁剪失败，请重新选择照片');
    image.src = source;
  };

  const reset = () => { localStorage.removeItem(STORAGE_KEY); setAvatar(''); setSource(''); };

  return <>
    <button className={`avatar avatar-picker ${large?'large':''}`} onClick={() => inputRef.current?.click()} aria-label="选择头像照片">
      {avatar ? <img src={avatar} alt="我的头像"/> : <span>👩🏻</span>}
      <i><ImagePlus/></i>
    </button>
    <input ref={inputRef} className="avatar-file" type="file" accept="image/*" onChange={event => { choosePhoto(event.target.files?.[0]); event.currentTarget.value=''; }}/>
    {error && <div className="avatar-error" role="status">{error}</div>}
    {source && <div className="crop-mask" role="dialog" aria-modal="true" aria-label="裁剪头像">
      <section className="crop-dialog">
        <div className="crop-head"><h2>调整头像</h2><button onClick={() => setSource('')} aria-label="关闭裁剪"><X/></button></div>
        <div className="crop-preview" onPointerDown={startDrag} onPointerMove={dragPhoto} onPointerUp={stopDrag} onPointerCancel={stopDrag}><img src={source} alt="头像裁剪预览" draggable="false" style={{transform:`scale(${zoom})`,transformOrigin:`${positionX}% ${positionY}%`,objectPosition:`${positionX}% ${positionY}%`}}/></div>
        <label>缩放<input type="range" min="1" max="3" step=".05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
        <label>左右位置<input type="range" min="0" max="100" value={positionX} onChange={e=>setPositionX(Number(e.target.value))}/></label>
        <label>上下位置<input type="range" min="0" max="100" value={positionY} onChange={e=>setPositionY(Number(e.target.value))}/></label>
        <div className="crop-actions">{avatar&&<button className="crop-reset" onClick={reset}><RotateCcw/>恢复默认</button>}<button className="crop-save" onClick={saveCrop}>保存头像</button></div>
      </section>
    </div>}
  </>;
}
