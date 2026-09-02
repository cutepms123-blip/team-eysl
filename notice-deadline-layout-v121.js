/* TEAM EYSL notice deadline layout v121 */
(()=>{
  if(window.__NOTICE_DEADLINE_LAYOUT_V121__)return;
  window.__NOTICE_DEADLINE_LAYOUT_V121__=true;
  const style=document.createElement('style');
  style.id='NOTICE_DEADLINE_LAYOUT_V121_STYLE';
  style.textContent=`
    #noticePollComposerMount{min-width:0;max-width:100%;overflow:visible}
    #noticePollComposerMount .pollDeadlineCard{min-width:0;max-width:100%;overflow:hidden;padding:12px!important}
    #noticePollComposerMount .pollDeadlineCard input[type="datetime-local"]{
      display:block!important;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      box-sizing:border-box!important;
      padding:11px 10px!important;
      font-size:12px!important;
      line-height:1.2!important;
    }
    @media(max-width:430px){
      #noticePollComposerMount .pollDeadlineCard{padding:11px!important}
      #noticePollComposerMount .pollDeadlineCard input[type="datetime-local"]{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        padding:10px 8px!important;
        font-size:11px!important;
      }
    }
  `;
  document.head.appendChild(style);

  if(!document.querySelector('script[data-race-attachment-v123]')){
    const script=document.createElement('script');
    script.src='/race-attachment-v123.js?v=final123-race-attachment';
    script.async=false;
    script.dataset.raceAttachmentV123='1';
    document.body.appendChild(script);
  }
})();
