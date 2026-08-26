/* TEAM EYSL v94 — notice timestamps */
(()=>{
  const formatDateTime=(value)=>{
    if(!value)return '-';
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return String(value);
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    const h=String(d.getHours()).padStart(2,'0');
    const min=String(d.getMinutes()).padStart(2,'0');
    return `${y}-${m}-${day} ${h}:${min}`;
  };
  if(typeof window.fmtDateFromIso==='function'){
    window.fmtDateFromIso=formatDateTime;
  }
  console.log('TEAM EYSL timestamp v94 loaded');
})();
