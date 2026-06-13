import { useState, useEffect, useRef, useCallback } from "react";
import KRV14Addons from "./KRV14Addons.jsx";
import KRV5Addons from "./KRV5Addons.jsx";
import KRV6Addons from "./KRV6Addons.jsx";
import KRV7Addons from "./KRV7Addons.jsx";
import KRV8Addons from "./KRV8Addons.jsx";
import KRV9Addons from "./KRV9Addons.jsx";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#08080f;--bg2:#0f0d1a;--bg3:#161228;--bg4:#1d1535;
  --border:#251d42;--border2:#3a2d6a;
  --purple:#b026ff;--purple2:#7c00cc;--purple3:#3d0080;
  --cyan:#00f5ff;--cyan2:#00aabb;
  --pink:#ff2d78;--gold:#ffd60a;--green:#00e676;
  --warn:#ff9100;--error:#ff1744;--muted:#5a5480;
  --text:#e8e8f4;--text2:#a8a8c8;
  --glow-purple:0 0 20px rgba(176,38,255,.5);
  --glow-cyan:0 0 20px rgba(0,245,255,.5);
}
html,body,#root{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

/* ── LAYOUT ── */
.app{display:flex;height:100vh;position:relative;overflow:hidden}
.app::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px);pointer-events:none;z-index:9999}

/* ── SIDEBAR ── */
.sidebar{width:64px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px;z-index:10;transition:width .3s cubic-bezier(.4,0,.2,1);position:relative}
.sidebar:hover{width:200px}
.sidebar .logo{width:100%;padding:8px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;overflow:hidden;flex-shrink:0}
.logo-icon{width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 35%,var(--purple3),var(--bg));border:2px solid var(--purple);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;box-shadow:var(--glow-purple)}
.logo-text{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:20px;letter-spacing:3px;color:var(--purple);text-shadow:var(--glow-purple);white-space:nowrap;opacity:0;transition:opacity .2s .1s}
.sidebar:hover .logo-text{opacity:1}
.nav-item{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;border-left:3px solid transparent;transition:all .15s;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;color:var(--muted);white-space:nowrap;overflow:hidden;position:relative}
.nav-item:hover{color:var(--text2);background:rgba(176,38,255,.06);border-left-color:rgba(176,38,255,.4)}
.nav-item.active{color:var(--purple);background:rgba(176,38,255,.12);border-left-color:var(--purple)}
.nav-item .ni{font-size:18px;flex-shrink:0;width:40px;text-align:center}
.nav-item span{opacity:0;transition:opacity .2s .1s}
.sidebar:hover .nav-item span{opacity:1}
.nav-badge{position:absolute;right:10px;background:var(--pink);color:#fff;font-size:9px;font-family:'Rajdhani',sans-serif;font-weight:700;padding:1px 5px;border-radius:10px;opacity:0;transition:opacity .2s .1s}
.sidebar:hover .nav-badge{opacity:1}
.sidebar-bottom{margin-top:auto;width:100%;padding:8px 0}
.sys-dot{display:flex;align-items:center;gap:6px;padding:4px 14px;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--muted);white-space:nowrap;overflow:hidden}
.sys-dot .dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.sys-dot span{opacity:0;transition:opacity .2s}
.sidebar:hover .sys-dot span{opacity:1}
.dot-on{background:var(--green);box-shadow:0 0 6px var(--green)}
.dot-off{background:var(--muted)}
.dot-warn{background:var(--warn);box-shadow:0 0 6px var(--warn)}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

/* ── TOPBAR ── */
.topbar{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--border);background:var(--bg2);flex-shrink:0;min-height:52px}
.topbar-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.topbar-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:16px;letter-spacing:2px;color:var(--text);white-space:nowrap}
.topbar-sub{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;white-space:nowrap}
.topbar-right{display:flex;gap:6px;align-items:center;flex-shrink:0}
.icon-btn{width:34px;height:34px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;color:var(--muted);transition:all .15s;flex-shrink:0}
.icon-btn:hover{border-color:var(--purple);color:var(--purple)}
.icon-btn.active{border-color:var(--cyan);color:var(--cyan);background:rgba(0,245,255,.06)}

/* ── CONTENT ── */
.content{flex:1;overflow-y:auto;padding:16px}

/* ── CARDS ── */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px}
.card-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:14px;letter-spacing:2px;color:var(--cyan);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.card-sub{font-size:11px;color:var(--muted);margin-bottom:10px;line-height:1.5}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}

/* ── BTN ── */
.btn{display:flex;align-items:center;justify-content:center;gap:6px;border:none;border-radius:10px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-weight:600;letter-spacing:1px;transition:all .15s;padding:0 16px;height:38px;font-size:13px}
.btn-primary{background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff}
.btn-primary:hover{box-shadow:var(--glow-purple);transform:translateY(-1px)}
.btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--text2)}
.btn-outline:hover{border-color:var(--purple);color:var(--purple)}
.btn-cyan{background:linear-gradient(135deg,rgba(0,245,255,.2),rgba(0,170,187,.2));border:1px solid var(--cyan2);color:var(--cyan)}
.btn-cyan:hover{box-shadow:var(--glow-cyan)}
.btn-danger{background:rgba(255,23,68,.1);border:1px solid var(--error);color:var(--error)}
.btn-gold{background:rgba(255,214,10,.1);border:1px solid var(--gold);color:var(--gold)}
.btn-sm{height:30px;font-size:11px;padding:0 12px}
.btn-full{width:100%}
.btn-icon-only{width:38px;height:38px;padding:0;border-radius:8px}

/* ── FIELD ── */
.field{display:flex;flex-direction:column;gap:4px}
.field label,.flabel{font-size:10px;font-family:'Rajdhani',sans-serif;letter-spacing:1px;color:var(--muted);text-transform:uppercase}
.finput{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;outline:none;transition:border-color .15s;width:100%}
.finput:focus{border-color:var(--purple)}
.finput::placeholder{color:var(--muted)}
select.finput option{background:var(--bg3)}

/* ── CHAT ── */
.chat-wrap{display:flex;flex-direction:column;height:100%;gap:0}
.chat-header{display:flex;align-items:center;gap:14px;padding:12px 0;flex-shrink:0;border-bottom:1px solid var(--border);margin-bottom:12px}
.kr-orb{position:relative;width:56px;height:56px;flex-shrink:0}
.kr-orb .face{width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 35% 35%,var(--purple3),var(--bg));border:2px solid var(--purple);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:var(--glow-purple);transition:box-shadow .3s}
.kr-orb .ring{position:absolute;inset:-6px;border-radius:50%;border:1px solid var(--purple);opacity:.4;animation:spin 8s linear infinite}
.kr-orb .ring2{position:absolute;inset:-12px;border-radius:50%;border:1px dashed var(--cyan);opacity:.2;animation:spin 15s linear infinite reverse}
.kr-orb.thinking .face{box-shadow:0 0 40px rgba(0,245,255,.7);animation:throb 1s ease infinite alternate}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes throb{from{box-shadow:0 0 20px rgba(0,245,255,.4)}to{box-shadow:0 0 60px rgba(0,245,255,.9)}}
.kr-info{flex:1}
.kr-name-big{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:20px;letter-spacing:3px;color:var(--purple);text-shadow:var(--glow-purple)}
.kr-tagline{font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-top:2px}
.kr-mode-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;border:1px solid var(--cyan2);color:var(--cyan);font-size:10px;font-family:'Rajdhani',sans-serif;letter-spacing:1px;margin-top:4px}

.messages{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding-right:4px}
.msg{display:flex;gap:10px;animation:fadeUp .2s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.msg.user{flex-direction:row-reverse}
.msg-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.msg.kr .msg-av{background:radial-gradient(circle,var(--purple3),var(--bg));border:1px solid var(--purple)}
.msg.user .msg-av{background:var(--bg3);border:1px solid var(--border)}
.msg-body{max-width:80%;display:flex;flex-direction:column;gap:3px}
.msg.user .msg-body{align-items:flex-end}
.msg-name{font-size:9px;font-family:'Rajdhani',sans-serif;letter-spacing:1px;color:var(--muted);padding:0 4px}
.msg-bubble{padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
.msg.kr .msg-bubble{background:var(--bg3);border:1px solid var(--border);border-bottom-left-radius:3px;color:var(--text)}
.msg.user .msg-bubble{background:linear-gradient(135deg,var(--purple3),#1a0a2e);border:1px solid var(--purple);border-bottom-right-radius:3px}
.msg-time{font-size:9px;color:var(--muted);padding:0 4px;font-family:'JetBrains Mono',monospace}
.msg-img{max-width:240px;border-radius:10px;border:1px solid var(--border);margin-top:6px}
.typing{display:flex;gap:4px;padding:10px 14px;align-items:center}
.tdot{width:6px;height:6px;border-radius:50%;background:var(--purple);animation:td 1.2s infinite}
.tdot:nth-child(2){animation-delay:.2s}.tdot:nth-child(3){animation-delay:.4s}
@keyframes td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}

.chat-input-area{padding:10px 0 0;border-top:1px solid var(--border);flex-shrink:0;display:flex;flex-direction:column;gap:8px}
.quick-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}
.quick-chips::-webkit-scrollbar{display:none}
.chip{flex-shrink:0;padding:4px 10px;border-radius:20px;background:var(--bg3);border:1px solid var(--border);font-size:11px;font-family:'Rajdhani',sans-serif;letter-spacing:.5px;color:var(--muted);cursor:pointer;transition:all .15s;white-space:nowrap}
.chip:hover{border-color:var(--purple);color:var(--purple);background:rgba(176,38,255,.06)}
.chat-row{display:flex;gap:8px;align-items:flex-end}
.chat-ta{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:10px 12px;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;resize:none;min-height:42px;max-height:100px;outline:none;transition:border-color .15s}
.chat-ta:focus{border-color:var(--purple)}
.chat-ta::placeholder{color:var(--muted)}
.voice-btn{width:42px;height:42px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;transition:all .15s;flex-shrink:0}
.voice-btn:hover{border-color:var(--cyan);color:var(--cyan)}
.voice-btn.listening{border-color:var(--pink);color:var(--pink);background:rgba(255,45,120,.08);animation:listenPulse 1s ease infinite}
@keyframes listenPulse{0%,100%{box-shadow:none}50%{box-shadow:0 0 16px rgba(255,45,120,.5)}}
.img-btn{width:42px;height:42px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;transition:all .15s;flex-shrink:0}
.img-btn:hover{border-color:var(--gold);color:var(--gold)}

/* ── MODE SELECTOR ── */
.mode-selector{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.mode-selector::-webkit-scrollbar{display:none}
.mode-card{flex-shrink:0;padding:8px 12px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);cursor:pointer;transition:all .15s;text-align:center;min-width:80px}
.mode-card:hover{border-color:var(--purple);background:rgba(176,38,255,.06)}
.mode-card.active{border-color:var(--purple);background:rgba(176,38,255,.12)}
.mode-card .mi{font-size:22px;margin-bottom:4px}
.mode-card .ml{font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text2)}
.mode-card.active .ml{color:var(--purple)}

/* ── POWER-UPS ── */
.pu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.pu-card{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;cursor:pointer;transition:all .15s}
.pu-card:hover{border-color:var(--purple);background:rgba(176,38,255,.06);transform:translateY(-1px)}
.pu-icon{font-size:20px;margin-bottom:6px}
.pu-name{font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;letter-spacing:.5px;color:var(--text)}
.pu-desc{font-size:10px;color:var(--muted);margin-top:2px;line-height:1.4}

/* ── TASKS ── */
.task-item{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px}
.task-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:13px;letter-spacing:.5px;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.task-steps{display:flex;flex-direction:column;gap:4px}
.task-step{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);padding:4px 0}
.task-step .sc{width:18px;height:18px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0}
.task-step.done .sc{background:var(--green);border-color:var(--green);color:var(--bg)}
.task-step.running .sc{border-color:var(--cyan);color:var(--cyan);animation:throb 1s infinite}
.task-step.pending .sc{color:var(--muted)}
.task-progress{height:3px;background:var(--border);border-radius:2px;margin-top:8px;overflow:hidden}
.task-bar{height:100%;background:linear-gradient(90deg,var(--purple),var(--cyan));border-radius:2px;transition:width .5s ease}

/* ── BRAIN PROFILE ── */
.brain-field{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px}
.brain-field-label{font-size:10px;font-family:'Rajdhani',sans-serif;letter-spacing:1px;color:var(--cyan);margin-bottom:4px}
.brain-field-val{font-size:12px;color:var(--text2);line-height:1.5}

/* ── DEVICES ── */
.device-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;transition:all .2s}
.device-card:hover{border-color:var(--purple);background:rgba(176,38,255,.04)}
.device-card.on{border-color:var(--green)}
.d-icon{font-size:26px;margin-bottom:6px}
.d-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:14px;letter-spacing:1px}
.d-status{font-size:11px;color:var(--muted);margin-top:2px}
.device-card.on .d-status{color:var(--green)}
.action-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:7px;margin-top:10px}
.act-btn{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 10px;cursor:pointer;transition:all .15s;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600;letter-spacing:.5px;color:var(--text);display:flex;align-items:center;gap:7px}
.act-btn:hover{border-color:var(--purple);color:var(--purple);background:rgba(176,38,255,.05)}
.act-btn:active{transform:scale(.97)}

/* ── TRADING ── */
.trade-panel{display:grid;grid-template-columns:1fr;gap:10px}
.analysis-out{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:12px;line-height:1.75;white-space:pre-wrap;font-family:'JetBrains Mono',monospace;color:var(--text)}
.risk-bar{background:rgba(255,23,68,.08);border:1px solid var(--error);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--error);display:flex;gap:8px;margin-bottom:10px}
.trade-stat{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;text-align:center}
.ts-val{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:18px;color:var(--cyan)}
.ts-lbl{font-size:10px;color:var(--muted);margin-top:2px;font-family:'Rajdhani',sans-serif;letter-spacing:1px}

/* ── MEMORY ── */
.mem-item{background:var(--bg3);border:1px solid var(--border);border-radius:9px;padding:11px 13px;margin-bottom:7px;display:flex;gap:10px;align-items:flex-start}
.mem-ico{font-size:15px;flex-shrink:0;margin-top:1px}
.mem-body{flex:1}
.mem-text{font-size:12px;color:var(--text);line-height:1.5}
.mem-meta{display:flex;gap:6px;align-items:center;margin-top:5px;flex-wrap:wrap}
.tag{display:inline-block;padding:2px 7px;border-radius:20px;font-size:9px;font-family:'Rajdhani',sans-serif;letter-spacing:.5px;font-weight:700}
.tag-rule{background:rgba(255,214,10,.1);border:1px solid var(--gold);color:var(--gold)}
.tag-trade{background:rgba(0,245,255,.08);border:1px solid var(--cyan2);color:var(--cyan)}
.tag-log{background:rgba(176,38,255,.1);border:1px solid rgba(176,38,255,.4);color:var(--purple)}
.tag-brain{background:rgba(0,230,118,.08);border:1px solid var(--green);color:var(--green)}
.mem-date{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace}

/* ── BRIEFING ── */
.brief-card{background:linear-gradient(135deg,var(--bg3),var(--bg4));border:1px solid var(--border2);border-radius:12px;padding:14px;margin-bottom:10px;position:relative;overflow:hidden}
.brief-card::before{content:'';position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle,rgba(176,38,255,.15),transparent);border-radius:50%}
.brief-section{margin-bottom:10px}
.brief-label{font-size:10px;font-family:'Rajdhani',sans-serif;letter-spacing:1.5px;color:var(--muted);margin-bottom:5px;text-transform:uppercase}
.brief-content{font-size:12px;color:var(--text2);line-height:1.6}
.brief-item{display:flex;gap:8px;padding:3px 0;font-size:12px;color:var(--text2)}
.brief-item::before{content:'›';color:var(--purple);font-size:14px;flex-shrink:0}

/* ── ALERTS ── */
.alert-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:9px;margin-bottom:7px;border:1px solid var(--border)}
.alert-item.high{background:rgba(255,23,68,.06);border-color:rgba(255,23,68,.3)}
.alert-item.med{background:rgba(255,145,0,.06);border-color:rgba(255,145,0,.3)}
.alert-item.low{background:rgba(0,245,255,.04);border-color:rgba(0,245,255,.2)}
.alert-ico{font-size:16px;flex-shrink:0}
.alert-body{flex:1}
.alert-title{font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;letter-spacing:.5px}
.alert-desc{font-size:11px;color:var(--text2);margin-top:2px;line-height:1.4}
.alert-time{font-size:9px;color:var(--muted);margin-top:3px;font-family:'JetBrains Mono',monospace}

/* ── TOGGLE ── */
.toggle{position:relative;width:40px;height:22px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.ts{position:absolute;inset:0;border-radius:22px;cursor:pointer;background:var(--border);transition:background .2s}
.ts::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
.toggle input:checked~.ts{background:var(--purple)}
.toggle input:checked~.ts::after{transform:translateX(18px)}

/* ── SETTINGS ── */
.srow{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)}
.srow-info{flex:1}
.slabel{font-size:13px;color:var(--text)}
.ssub{font-size:10px;color:var(--muted);margin-top:2px}
.env-item{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.env-k{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--cyan);width:210px;flex-shrink:0}
.env-v{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:3px 8px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.code-blk{background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:10px 12px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--cyan);overflow-x:auto;white-space:pre;margin-top:8px}
.setup-step{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.step-n{width:22px;height:22px;border-radius:50%;background:rgba(176,38,255,.15);border:1px solid var(--purple);display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:11px;color:var(--purple);flex-shrink:0;margin-top:1px}
.step-c{flex:1}
.step-t{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:13px;letter-spacing:1px;color:var(--text)}
.step-d{font-size:11px;color:var(--muted);margin-top:3px;line-height:1.5}

/* ── BOTTOM NAV ── */
.bnav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);flex-direction:row;z-index:100;padding-bottom:env(safe-area-inset-bottom)}
.bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:9px 4px 7px;cursor:pointer;gap:2px;font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;letter-spacing:.5px;color:var(--muted);transition:color .15s;border-top:2px solid transparent}
.bnav-item .bi{font-size:19px}
.bnav-item.active{color:var(--purple);border-top-color:var(--purple)}

/* ── MISC ── */
.empty{text-align:center;padding:32px 16px;color:var(--muted)}
.empty-ic{font-size:36px;margin-bottom:10px}
.empty-t{font-size:12px;line-height:1.6}
.divider{height:1px;background:var(--border);margin:12px 0}
.pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:10px;font-family:'Rajdhani',sans-serif;font-weight:700;letter-spacing:.5px}
.pill-purple{background:rgba(176,38,255,.12);border:1px solid rgba(176,38,255,.3);color:var(--purple)}
.pill-cyan{background:rgba(0,245,255,.08);border:1px solid rgba(0,245,255,.25);color:var(--cyan)}
.pill-green{background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.3);color:var(--green)}
.pill-warn{background:rgba(255,145,0,.1);border:1px solid rgba(255,145,0,.3);color:var(--warn)}
.progress-ring{animation:throb 2s ease infinite}

@media(max-width:768px){
  .sidebar{display:none}
  .bnav{display:flex}
  .main{padding-bottom:58px}
  .grid2{grid-template-columns:1fr 1fr}
  .grid3{grid-template-columns:1fr 1fr}
  .content{padding:12px}
}
@media(min-width:769px){
  .sidebar{display:flex}
  .bnav{display:none}
}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (d=new Date())=>d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const fmtDate = ()=>new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});

// ─── AI CALL ─────────────────────────────────────────────────────────────────
async function askKR(messages, systemExtra="", imageBase64=null) {
  const res = await fetch("/api/kr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemExtra, imageBase64 })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.reply || data.error || "K-R backend error");
  return data.reply || "No response from K-R.";
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const MODES = [
  {id:"assistant",icon:"🤖",label:"Assistant"},
  {id:"trading",  icon:"📈",label:"Trader"},
  {id:"research", icon:"🔬",label:"Research"},
  {id:"writer",   icon:"✍️", label:"Writer"},
  {id:"coder",    icon:"💻",label:"Coder"},
  {id:"planner",  icon:"📋",label:"Planner"},
];

const MODE_PROMPTS = {
  assistant:"You are in General Assistant mode. Help Dikong with anything efficiently.",
  trading:"You are in Trading Analyst mode. Focus on crypto market analysis, BTC/ETH/altcoins, technical analysis, risk management. NEVER execute trades.",
  research:"You are in Research Agent mode. Deep-dive any topic, compile information, summarize findings clearly for Dikong.",
  writer:"You are in Content Writer mode. Help Dikong write posts, emails, scripts, captions, content strategies.",
  coder:"You are in Code Helper mode. Help Dikong with code, scripts, debugging, and technical architecture.",
  planner:"You are in Daily Planner mode. Help Dikong plan tasks, schedule, prioritize goals, manage time.",
};

const QUICK_CHIPS = {
  assistant:["Brief me today","What's BTC doing?","Open Binance","Any urgent alerts?"],
  trading:["Analyze BTC/USDT 15m","Check ETH trend","Calculate risk for $100","Scalp setup?"],
  research:["Latest crypto news","Research Solana ecosystem","Compare MEXC vs Binance","What is RSI divergence?"],
  writer:["Write a tweet about crypto","Draft a quick update","Caption for chart post","Cold email template"],
  coder:["Python Solana bot snippet","Debug my script","API call example","Tasker HTTP request"],
  planner:["Plan my trading day","Morning routine checklist","Weekly goals template","Priority matrix"],
};

const POWER_UPS = [
  {icon:"🌅",name:"Morning Brief",desc:"Daily summary: market, tasks, reminders",id:"morning"},
  {icon:"📊",name:"Trade Recap",desc:"Summarize today's trades & lessons",id:"recap"},
  {icon:"📰",name:"Crypto News",desc:"Latest relevant crypto headlines",id:"news"},
  {icon:"⚡",name:"Risk Calc",desc:"Calculate position size & risk %",id:"risk"},
  {icon:"🐦",name:"Tweet Gen",desc:"Generate crypto/insight tweet",id:"tweet"},
  {icon:"📧",name:"Email Draft",desc:"Write a professional email fast",id:"email"},
  {icon:"🔍",name:"Coin Research",desc:"Quick deep-dive on any coin",id:"coin"},
  {icon:"📝",name:"Trade Journal",desc:"Log & reflect on a trade",id:"journal"},
  {icon:"💡",name:"Idea Validator",desc:"Validate a project or trade idea",id:"idea"},
  {icon:"🌐",name:"Web Summary",desc:"Summarize any URL content",id:"web"},
  {icon:"🧮",name:"P&L Calc",desc:"Calculate profit/loss quickly",id:"pnl"},
  {icon:"📣",name:"Social Post",desc:"Create engaging social post",id:"social"},
];

const PHONE_ACTIONS = [
  {id:"open_binance",icon:"📊",label:"Binance"},
  {id:"open_mexc",icon:"💹",label:"MEXC"},
  {id:"open_gateio",icon:"🔑",label:"Gate.io"},
  {id:"open_chrome",icon:"🌐",label:"Chrome"},
  {id:"open_calculator",icon:"🔢",label:"Calculator"},
  {id:"open_settings",icon:"⚙️",label:"Settings"},
  {id:"open_tasker",icon:"⚡",label:"Tasker"},
  {id:"check_notifications",icon:"🔔",label:"Notifs"},
];
const LAPTOP_ACTIONS = [
  {id:"open_chrome",icon:"🌐",label:"Chrome"},
  {id:"open_notepad",icon:"📝",label:"Notepad"},
  {id:"open_calculator",icon:"🔢",label:"Calc"},
  {id:"take_screenshot",icon:"📷",label:"Screenshot"},
  {id:"open_explorer",icon:"📁",label:"Explorer"},
  {id:"open_terminal",icon:"💻",label:"Terminal"},
];

const TASK_TEMPLATES = [
  {name:"Trading Session Prep",icon:"📈",steps:["Check BTC/ETH price","Pull market news","Open MEXC app","Set price alerts","Log session start"]},
  {name:"Morning Briefing",icon:"🌅",steps:["Get market summary","Check overnight moves","Read top 3 headlines","Review open positions","Plan the day"]},
  {name:"Research Coin",icon:"🔬",steps:["Get coin overview","Check tokenomics","Review chart pattern","Assess risk level","Write summary note"]},
  {name:"End of Day Review",icon:"🌙",steps:["Log all trades","Calculate P&L","Note lessons learned","Update trading rules","Plan tomorrow"]},
];

const MEMORY_SEED = [
  {id:1,type:"rule",icon:"⚖️",tag:"rule",text:"Never auto-confirm trades. Always ask Dikong before any buy/sell execution.",ts:"2025-06-01"},
  {id:2,type:"trade",icon:"📈",tag:"trade",text:"Dikong prefers scalping BTC/USDT and ETH/USDT on MEXC. Favors 5m and 15m charts.",ts:"2025-06-02"},
  {id:3,type:"rule",icon:"🔒",tag:"rule",text:"Never delete any file without explicit confirmation. Security first.",ts:"2025-06-01"},
  {id:4,type:"brain",icon:"🧠",tag:"brain",text:"Dikong is an independent builder and crypto trader working on Solana bots and AI projects.",ts:"2025-06-10"},
  {id:5,type:"trade",icon:"💡",tag:"trade",text:"Risk rule: Never risk more than 1-2% per trade. Always define stop loss before entry.",ts:"2025-06-03"},
];

const BRAIN_DEFAULTS = {
  name:"Dikong",
  tradingStyle:"Scalping, 5m-15m timeframes, BTC/USDT and ETH/USDT",
  riskTolerance:"1-2% per trade maximum",
  exchanges:"MEXC primary, Binance secondary, Gate.io for altcoins",
  projects:"Solana bots, AI integrations, Web3 projects",
  language:"English (Filipino context)",
  personality:"Direct, efficient, no wasted words",
};

const SETUP_STEPS = [
  {num:1,title:"Deploy to Vercel via GitHub",desc:"Fork repo, connect to Vercel. Auto-deploys on every git push.",code:`git clone https://github.com/yourname/kr-jarvis
cd kr-jarvis && npm install && vercel deploy`},
  {num:2,title:"Set Vercel Environment Variables",desc:"In Vercel Dashboard → Settings → Environment Variables:",code:`GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
JOIN_API_KEY=your_join_key
JOIN_DEVICE_ID=your_phone_device_id`},
  {num:3,title:"Create Supabase Tables",desc:"Run in Supabase SQL Editor:",code:`CREATE TABLE kr_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text, content text, tag text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE kr_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text, steps jsonb, status text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE kr_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text, message text, priority text,
  created_at timestamptz DEFAULT now()
);`},
  {num:4,title:"Join + Tasker Setup on Android",desc:"Install Join app. Create Tasker profile to receive kr_command pushes via HTTP.",code:`// Join API KR calls:
POST https://joinjoaomgcd.appspot.com/_ah/api/
  messaging/v1/sendPush
  ?apikey=JOIN_KEY&deviceId=DEVICE_ID
  &text=kr_command:open_binance`},
  {num:5,title:"Python Laptop Agent",desc:"Run on Windows laptop. Polls KR API for commands every 3 seconds.",code:`# pip install pyautogui requests
import pyautogui, requests, time, subprocess
API = "https://your-app.vercel.app/api/laptop"

COMMANDS = {
  "open_chrome": lambda: subprocess.Popen(["chrome.exe"]),
  "open_notepad": lambda: subprocess.Popen(["notepad.exe"]),
  "take_screenshot": lambda: pyautogui.screenshot().save("kr_shot.png"),
}
while True:
    try:
        cmd = requests.get(API,timeout=5).json().get("command")
        if cmd in COMMANDS: COMMANDS[cmd]()
    except: pass
    time.sleep(3)`},
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// ── CHAT ──
function ChatTab({memory,setMemory,brain}){
  const [msgs,setMsgs]=useState([{role:"kr",text:`Systems online, Dikong. Suit integrity at 100%. How may I assist you today, sir?\n\nI'm your personal J.A.R.V.I.S. — choose a mode or speak freely.`,ts:fmt()}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [listening,setListening]=useState(false);
  const [mode,setMode]=useState("assistant");
  const [speaking,setSpeaking]=useState(false);
  const [imgPreview,setImgPreview]=useState(null);
  const [imgData,setImgData]=useState(null);
  const endRef=useRef(null);
  const recogRef=useRef(null);
  const fileRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[msgs,loading]);

  const speak=(text)=>{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/[*_#`]/g,"").slice(0,300));
    u.rate=1.05;u.pitch=.9;u.volume=1;
    const voices=window.speechSynthesis.getVoices();
    const v=voices.find(v=>v.name.includes("Google US English")||v.name.includes("Daniel")||v.lang==="en-US");
    if(v) u.voice=v;
    setSpeaking(true);
    u.onend=()=>setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const send=useCallback(async(text=input.trim())=>{
    if((!text&&!imgData)||loading) return;
    setInput(""); const t=text||"[Image sent for analysis]";
    const userMsg={role:"user",text:t,ts:fmt(),image:imgData||undefined};
    setMsgs(prev=>[...prev,userMsg]);
    setImgPreview(null); setImgData(null);
    setLoading(true);
    try{
      const brainCtx=`\nKnown about Dikong:\n- Trading style: ${brain.tradingStyle}\n- Risk: ${brain.riskTolerance}\n- Exchanges: ${brain.exchanges}\n- Projects: ${brain.projects}`;
      const history=[...msgs,userMsg];
      const reply=await askKR(history,MODE_PROMPTS[mode]+brainCtx,imgData);
      const krMsg={role:"kr",text:reply,ts:fmt()};
      setMsgs(prev=>[...prev,krMsg]);
      speak(reply);
      if(/trade|buy|sell|btc|eth|mexc|binance/i.test(t)){
        setMemory(prev=>[{id:Date.now(),type:"log",icon:"💬",tag:"log",
          text:`[${mode}] ${t.slice(0,80)}...`,ts:new Date().toISOString().slice(0,10)},...prev].slice(0,30));
      }
    }catch(e){
      setMsgs(prev=>[...prev,{role:"kr",text:`⚠️ Signal disrupted, Dikong. ${e.message}`,ts:fmt()}]);
    }
    setLoading(false);
  },[input,loading,msgs,mode,brain,setMemory,imgData]);

  const onKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};

  const toggleVoice=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Voice not supported on this browser.");return;}
    if(listening){recogRef.current?.stop();setListening(false);return;}
    const r=new SR(); r.lang="en-US";r.continuous=false;r.interimResults=false;
    r.onresult=e=>{setInput(e.results[0][0].transcript);setListening(false);};
    r.onerror=()=>setListening(false); r.onend=()=>setListening(false);
    recogRef.current=r; r.start(); setListening(true);
  };

  const onImgChange=e=>{
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const b64=ev.target.result.split(",")[1];
      setImgData(b64);
      setImgPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return(
    <div className="chat-wrap">
      <div className="chat-header">
        <div className={`kr-orb${loading?" thinking":""}`}>
          <div className="ring"/><div className="ring2"/>
          <div className="face">🤖</div>
        </div>
        <div className="kr-info">
          <div className="kr-name-big">K-R</div>
          <div className="kr-tagline">{loading?"processing...":speaking?"speaking...":"standing by"}</div>
          <div className="kr-mode-badge">⚡ {MODES.find(m=>m.id===mode)?.label||"Assistant"} Mode</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={()=>window.speechSynthesis?.cancel()} title="Stop voice">{speaking?"🔇 Stop":"🔊"}</button>
      </div>

      {/* MODE SELECTOR */}
      <div className="mode-selector" style={{flexShrink:0,marginBottom:10}}>
        {MODES.map(m=>(
          <div key={m.id} className={`mode-card${mode===m.id?" active":""}`} onClick={()=>setMode(m.id)}>
            <div className="mi">{m.icon}</div>
            <div className="ml">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="messages">
        {msgs.map((m,i)=>(
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-av">{m.role==="kr"?"🤖":"👤"}</div>
            <div className="msg-body">
              <div className="msg-name">{m.role==="kr"?"K-R":"Dikong"}</div>
              {m.image&&<img src={`data:image/jpeg;base64,${m.image}`} className="msg-img" alt=""/>}
              <div className="msg-bubble">{m.text}</div>
              <div className="msg-time">{m.ts}</div>
            </div>
          </div>
        ))}
        {loading&&(
          <div className="msg kr">
            <div className="msg-av">🤖</div>
            <div className="msg-body">
              <div className="msg-name">K-R</div>
              <div className="msg-bubble"><div className="typing"><div className="tdot"/><div className="tdot"/><div className="tdot"/></div></div>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div className="chat-input-area">
        <div className="quick-chips">
          {(QUICK_CHIPS[mode]||QUICK_CHIPS.assistant).map(c=>(
            <div key={c} className="chip" onClick={()=>send(c)}>{c}</div>
          ))}
        </div>
        {imgPreview&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <img src={imgPreview} style={{height:50,borderRadius:6,border:"1px solid var(--border)"}} alt=""/>
            <span style={{fontSize:11,color:"var(--muted)"}}>Image ready</span>
            <button onClick={()=>{setImgPreview(null);setImgData(null);}} style={{background:"none",border:"none",color:"var(--error)",cursor:"pointer",fontSize:14}}>×</button>
          </div>
        )}
        <div className="chat-row">
          <button className={`voice-btn${listening?" listening":""}`} onClick={toggleVoice} title="Voice input">🎙️</button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={onImgChange}/>
          <button className="img-btn" onClick={()=>fileRef.current?.click()} title="Attach image/chart">📎</button>
          <textarea className="chat-ta" placeholder={`Message K-R in ${MODES.find(m=>m.id===mode)?.label} mode...`}
            value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} rows={1}/>
          <button className="btn btn-primary btn-icon-only" onClick={()=>send()} disabled={(!input.trim()&&!imgData)||loading}>▶</button>
        </div>
      </div>
    </div>
  );
}

// ── POWER-UPS ──
function PowerUpsTab({brain}){
  const [active,setActive]=useState(null);
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [extra,setExtra]=useState("");

  const run=async(pu)=>{
    setActive(pu.id); setResult(""); setLoading(true);
    const prompts={
      morning:`Generate K-R's morning briefing for Dikong.\nTrading style: ${brain.tradingStyle}\nExchanges: ${brain.exchanges}\nInclude: 1) Crypto market status 2) BTC/ETH key levels to watch 3) Top 3 things to do today 4) One motivational insight.\nBe concise and Jarvis-like.`,
      recap:`Create a trading session recap template for Dikong to fill in, covering: trades taken, wins/losses, lessons, emotional state, tomorrow's plan. Make it structured.`,
      news:`Give Dikong the most relevant crypto market insights right now: BTC trend, altcoin sentiment, key news themes, and one actionable observation.`,
      risk:`Explain position sizing and risk management for a ${brain.riskTolerance} risk tolerance. Give a practical example with MEXC on a $1000 account.`,
      tweet:`Write 3 different tweet options for a crypto/builder content post. Short, punchy, no hashtag overload. Relevant to someone who trades and builds.`,
      email:`Write a professional cold email template that Dikong can customize. Short, direct, high open-rate structure.`,
      coin:`${extra?`Research ${extra} for Dikong:`:"Ask what coin to research. Write a quick-research template covering:"} tokenomics, chart pattern type, team, risk rating, verdict.`,
      journal:`Create a trade journal entry template for Dikong with: pair, direction, entry, SL, TP, result, emotional notes, lesson. Structured and clear.`,
      idea:`${extra?`Validate this idea for Dikong: "${extra}":`:"Give Dikong a framework to validate any trading or project idea."} Cover: pros, cons, risks, first 3 steps.`,
      web:`${extra?`Summarize this URL for Dikong: ${extra}`:"Explain to Dikong how to send K-R a URL and get a summary. Show the format."}`,
      pnl:`Give Dikong a P&L calculator explanation and formula. Entry: ${extra||"?"}, show how to calculate profit, loss, and breakeven for crypto trades.`,
      social:`Write 2 engaging social media posts for Dikong about crypto trading lifestyle. Keep it authentic, not cringe.`,
    };
    try{
      const r=await askKR([{role:"user",text:prompts[pu.id]||`Execute the ${pu.name} power-up for Dikong.`}]);
      setResult(r);
    }catch(e){setResult(`⚠️ ${e.message}`);}
    setLoading(false);
  };

  const activePU=POWER_UPS.find(p=>p.id===active);
  return(
    <div>
      <div className="card">
        <div className="card-title">⚡ K-R Power-Ups</div>
        <div className="card-sub">One-tap specialist tools. K-R executes instantly with your personal context loaded.</div>
        <div className="pu-grid">
          {POWER_UPS.map(p=>(
            <div key={p.id} className="pu-card" onClick={()=>run(p)}>
              <div className="pu-icon">{p.icon}</div>
              <div className="pu-name">{p.name}</div>
              <div className="pu-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {(loading||result)&&(
        <div className="card">
          <div className="card-title">{activePU?.icon} {activePU?.name}</div>
          {["coin","idea","web","pnl"].includes(active)&&!result&&(
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input className="finput" value={extra} onChange={e=>setExtra(e.target.value)}
                placeholder={active==="coin"?"Coin name (e.g. SOL)":active==="idea"?"Describe your idea":active==="web"?"Paste URL":active==="pnl"?"Entry price":"Input..."}/>
              <button className="btn btn-cyan btn-sm" onClick={()=>activePU&&run(activePU)}>Run</button>
            </div>
          )}
          {loading&&<div style={{display:"flex",gap:4,padding:"10px 0"}}><div className="tdot"/><div className="tdot"/><div className="tdot"/></div>}
          {result&&<div className="analysis-out">{result}</div>}
        </div>
      )}
    </div>
  );
}

// ── TASKS ──
function TasksTab(){
  const [tasks,setTasks]=useState([]);
  const [running,setRunning]=useState(null);
  const [customGoal,setCustomGoal]=useState("");
  const [loading,setLoading]=useState(false);

  const startTask=async(template)=>{
    const task={...template,id:Date.now(),stepStatus:template.steps.map(()=>"pending"),startTime:fmt()};
    setTasks(prev=>[task,...prev]);
    setRunning(task.id);
    for(let i=0;i<task.steps.length;i++){
      setTasks(prev=>prev.map(t=>t.id===task.id?{...t,stepStatus:t.stepStatus.map((s,j)=>j===i?"running":s)}:t));
      await new Promise(r=>setTimeout(r,1200+Math.random()*800));
      setTasks(prev=>prev.map(t=>t.id===task.id?{...t,stepStatus:t.stepStatus.map((s,j)=>j===i?"done":s)}:t));
    }
    setRunning(null);
  };

  const runCustom=async()=>{
    if(!customGoal.trim()||loading) return;
    setLoading(true);
    try{
      const r=await askKR([{role:"user",text:`Break this goal into 5 precise steps for Dikong and list only the steps, numbered 1-5, no extra text:\n\nGoal: ${customGoal}`}]);
      const lines=r.split("\n").filter(l=>/^\d/.test(l.trim())).map(l=>l.replace(/^\d+[\.\)]\s*/,"").trim()).slice(0,5);
      if(lines.length>=2){
        startTask({name:customGoal.slice(0,40),icon:"⚡",steps:lines});
        setCustomGoal("");
      }
    }catch(e){alert("K-R couldn't parse that goal. Try being more specific.");}
    setLoading(false);
  };

  return(
    <div>
      <div className="card">
        <div className="card-title">🎯 Custom Goal</div>
        <div className="card-sub">Tell K-R your goal. He'll break it into steps and execute the sequence.</div>
        <div style={{display:"flex",gap:8}}>
          <input className="finput" value={customGoal} onChange={e=>setCustomGoal(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&runCustom()}
            placeholder="e.g. Prepare my trading session for today"/>
          <button className="btn btn-primary" onClick={runCustom} disabled={!customGoal.trim()||loading}>
            {loading?"⏳":"⚡ Run"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Task Templates</div>
        <div className="grid2">
          {TASK_TEMPLATES.map(t=>(
            <div key={t.name} className="device-card" style={{cursor:"pointer"}} onClick={()=>!running&&startTask(t)}>
              <div style={{fontSize:22,marginBottom:4}}>{t.icon}</div>
              <div className="d-name" style={{fontSize:13}}>{t.name}</div>
              <div className="d-status">{t.steps.length} steps</div>
            </div>
          ))}
        </div>
      </div>

      {tasks.length>0&&(
        <div className="card">
          <div className="card-title">🔄 Task Queue</div>
          {tasks.map(t=>{
            const done=t.stepStatus.filter(s=>s==="done").length;
            const pct=Math.round((done/t.steps.length)*100);
            return(
              <div key={t.id} className="task-item" style={{marginBottom:10}}>
                <div className="task-title">
                  <span>{t.icon}</span>{t.name}
                  <span className="pill pill-purple" style={{marginLeft:"auto"}}>{pct}%</span>
                </div>
                <div className="task-steps">
                  {t.steps.map((s,i)=>(
                    <div key={i} className={`task-step ${t.stepStatus[i]}`}>
                      <div className="sc">{t.stepStatus[i]==="done"?"✓":t.stepStatus[i]==="running"?"…":i+1}</div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="task-progress"><div className="task-bar" style={{width:`${pct}%`}}/></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── DEVICES ──
function DevicesTab({setMemory}){
  const [phone,setPhone]=useState(false);
  const [laptop,setLaptop]=useState(false);
  const [log,setLog]=useState([]);
  const [flash,setFlash]=useState(null);

  const act=async(device,action)=>{
    const msg=`${device}: ${action.label}`;
    setFlash(msg); setTimeout(()=>setFlash(null),3000);
    setLog(prev=>[{ts:fmt(),device,action:action.label,id:action.id},...prev].slice(0,30));
    setMemory(prev=>[{id:Date.now(),type:"log",icon:device==="Phone"?"📱":"💻",tag:"log",
      text:`${device} command: ${action.id}`,ts:new Date().toISOString().slice(0,10)},...prev].slice(0,30));
    try{
      const endpoint = device === "Phone" ? "/api/phone" : "/api/laptop";
      const res = await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:action.id,label:action.label})});
      const data = await res.json();
      if(!res.ok || data.ok === false) setFlash(`⚠️ ${device} bridge not connected: ${data.error || "check setup"}`);
      else setFlash(`✅ ${device} command sent: ${action.label}`);
    }catch(e){ setFlash(`⚠️ ${device} command failed: ${e.message}`); }
  };

  return(
    <div>
      <div className="grid2" style={{marginBottom:14}}>
        <div className={`device-card${phone?" on":""}`} onClick={()=>setPhone(v=>!v)}>
          <div className="d-icon">📱</div>
          <div className="d-name">Android Phone</div>
          <div className="d-status">{phone?"● Join Connected":"○ Tap to connect"}</div>
        </div>
        <div className={`device-card${laptop?" on":""}`} onClick={()=>setLaptop(v=>!v)}>
          <div className="d-icon">💻</div>
          <div className="d-name">Windows Laptop</div>
          <div className="d-status">{laptop?"● Agent Running":"○ Tap to connect"}</div>
        </div>
      </div>

      {flash&&<div style={{background:"rgba(0,230,118,.08)",border:"1px solid var(--green)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"var(--green)",marginBottom:12}}>✅ Sent — {flash}</div>}

      <div className="card">
        <div className="card-title">📱 Phone Control</div>
        <div className="card-sub">Routes: K-R → Join API → Tasker → AutoInput → App opens</div>
        <div className="action-grid">
          {PHONE_ACTIONS.map(a=><button key={a.id} className="act-btn" onClick={()=>act("Phone",a)}>{a.icon}{a.label}</button>)}
        </div>
      </div>
      <div className="card">
        <div className="card-title">💻 Laptop Control</div>
        <div className="card-sub">Routes: K-R → Python Agent polling → pyautogui / subprocess</div>
        <div className="action-grid">
          {LAPTOP_ACTIONS.map(a=><button key={a.id} className="act-btn" onClick={()=>act("Laptop",a)}>{a.icon}{a.label}</button>)}
        </div>
      </div>

      {log.length>0&&(
        <div className="card">
          <div className="card-title">📋 Command Log</div>
          {log.slice(0,8).map((l,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"5px 0",borderBottom:"1px solid var(--border)",fontSize:11,alignItems:"center"}}>
              <span style={{color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",fontSize:9}}>{l.ts}</span>
              <span style={{color:"var(--cyan)"}}>{l.device}</span>
              <span style={{flex:1,color:"var(--text2)"}}>{l.action}</span>
              <span className="pill pill-purple">sent</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TRADING ──
function TradingTab(){
  const [pair,setPair]=useState("BTC/USDT");
  const [tf,setTf]=useState("15m");
  const [dir,setDir]=useState("LONG");
  const [notes,setNotes]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [alerts,setAlerts]=useState([
    {id:1,type:"price",level:"med",icon:"📊",title:"BTC Approaching Key Level",desc:"BTC testing 67,500 resistance. Watch for reaction or breakout.",time:"10 min ago"},
    {id:2,type:"rule",level:"high",icon:"⚠️",title:"Risk Reminder",desc:"Never enter without defined stop loss. K-R reminds Dikong: 1-2% max risk.",time:"Always active"},
  ]);

  const analyze=async()=>{
    if(loading) return; setLoading(true); setResult("");
    const prompt=`Trading analysis for Dikong:\nPair: ${pair}\nTimeframe: ${tf}\nBias: ${dir}\nContext: ${notes||"None"}\n\nProvide:\n📍 Market Bias\n🎯 Entry Zone\n🛑 Stop Loss\n✅ TP1 & TP2\n❌ Invalidation\n⚠️ Risk Warning\n💡 K-R Verdict\n\nBe specific, concise, and honest. NEVER suggest executing — always say to confirm with Dikong.`;
    try{const r=await askKR([{role:"user",text:prompt}],"You are in Trading Analyst mode. Be precise and risk-aware.");setResult(r);}
    catch(e){setResult(`⚠️ ${e.message}`);}
    setLoading(false);
  };

  return(
    <div>
      <div className="risk-bar">⚠️ <span><strong>K-R NEVER auto-trades.</strong> All analysis is advisory only. Dikong must confirm every entry and exit.</span></div>

      <div className="card">
        <div className="card-title">🔔 Active Alerts</div>
        {alerts.map(a=>(
          <div key={a.id} className={`alert-item ${a.level}`}>
            <div className="alert-ico">{a.icon}</div>
            <div className="alert-body">
              <div className="alert-title">{a.title}</div>
              <div className="alert-desc">{a.desc}</div>
              <div className="alert-time">{a.time}</div>
            </div>
            <button onClick={()=>setAlerts(p=>p.filter(x=>x.id!==a.id))} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:16}}>×</button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">📈 Trade Analyzer</div>
        <div className="grid2" style={{marginBottom:10}}>
          <div className="field"><label>PAIR</label><input className="finput" value={pair} onChange={e=>setPair(e.target.value)}/></div>
          <div className="field"><label>TIMEFRAME</label>
            <select className="finput" value={tf} onChange={e=>setTf(e.target.value)}>
              {["1m","3m","5m","15m","30m","1h","4h","1d"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label>DIRECTION</label>
            <select className="finput" value={dir} onChange={e=>setDir(e.target.value)}>
              <option>LONG</option><option>SHORT</option><option>NEUTRAL</option>
            </select>
          </div>
          <div className="field"><label>EXCHANGE</label>
            <select className="finput"><option>MEXC</option><option>Binance</option><option>Gate.io</option></select>
          </div>
        </div>
        <div className="field" style={{marginBottom:10}}>
          <label>CONTEXT / NOTES</label>
          <textarea className="finput" value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="e.g. BTC broke above 68k on volume, forming higher lows..."/>
        </div>
        <button className="btn btn-primary btn-full" onClick={analyze} disabled={loading}>
          {loading?"⏳ K-R Analyzing...":"⚡ Analyze Trade"}
        </button>
        {result&&<div className="analysis-out" style={{marginTop:12}}>{result}</div>}
      </div>
    </div>
  );
}

// ── MEMORY ──
function MemoryTab({memory,setMemory}){
  const [filter,setFilter]=useState("all");
  const [newNote,setNewNote]=useState("");
  const filtered=filter==="all"?memory:memory.filter(m=>m.tag===filter);

  const add=()=>{
    if(!newNote.trim()) return;
    setMemory(prev=>[{id:Date.now(),type:"rule",icon:"📌",tag:"rule",
      text:newNote.trim(),ts:new Date().toISOString().slice(0,10)},...prev]);
    setNewNote("");
  };

  return(
    <div>
      <div className="card">
        <div className="card-title">🧠 K-R Memory Bank</div>
        <div className="card-sub">Rules, preferences, logs synced to Supabase. K-R loads these on every session.</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {["all","rule","trade","brain","log"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className="btn btn-outline btn-sm"
              style={{borderColor:filter===f?"var(--purple)":"var(--border)",color:filter===f?"var(--purple)":"var(--muted)"}}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        {filtered.length===0&&<div className="empty"><div className="empty-ic">🧩</div><div className="empty-t">No memories in this filter.</div></div>}
        {filtered.map(m=>(
          <div key={m.id} className="mem-item">
            <span className="mem-ico">{m.icon}</span>
            <div className="mem-body">
              <div className="mem-text">{m.text}</div>
              <div className="mem-meta">
                <span className={`tag tag-${m.tag}`}>{m.tag}</span>
                <span className="mem-date">{m.ts}</span>
              </div>
            </div>
            <button onClick={()=>setMemory(p=>p.filter(x=>x.id!==m.id))}
              style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:15,padding:"0 4px"}}>×</button>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">✏️ Add Memory</div>
        <div style={{display:"flex",gap:8}}>
          <input className="finput" value={newNote} onChange={e=>setNewNote(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()} placeholder="e.g. Only trade during London-NY overlap hours"/>
          <button className="btn btn-primary btn-sm" onClick={add}>SAVE</button>
        </div>
      </div>
    </div>
  );
}

// ── BRAIN PROFILE ──
function BrainTab({brain,setBrain}){
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState({...brain});

  const save=()=>{setBrain(draft);setEditing(false);};

  const fields=[
    {k:"name",label:"Your Name"},
    {k:"tradingStyle",label:"Trading Style"},
    {k:"riskTolerance",label:"Risk Tolerance"},
    {k:"exchanges",label:"Exchanges Used"},
    {k:"projects",label:"Active Projects"},
    {k:"language",label:"Language Preference"},
    {k:"personality",label:"Preferred Response Style"},
  ];

  return(
    <div>
      <div className="card">
        <div className="card-title">🧬 K-R Brain Profile</div>
        <div className="card-sub">This is what K-R knows about Dikong. Every chat, analysis, and power-up uses this context automatically.</div>
        {!editing?(
          <>
            {fields.map(f=>(
              <div key={f.k} className="brain-field">
                <div className="brain-field-label">{f.label}</div>
                <div className="brain-field-val">{brain[f.k]||"Not set"}</div>
              </div>
            ))}
            <button className="btn btn-primary btn-full" style={{marginTop:8}} onClick={()=>setEditing(true)}>✏️ Edit Brain Profile</button>
          </>
        ):(
          <>
            {fields.map(f=>(
              <div key={f.k} className="field" style={{marginBottom:8}}>
                <label>{f.label}</label>
                <input className="finput" value={draft[f.k]||""} onChange={e=>setDraft(d=>({...d,[f.k]:e.target.value}))}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button className="btn btn-primary btn-full" onClick={save}>💾 Save Brain</button>
              <button className="btn btn-outline" onClick={()=>setEditing(false)}>Cancel</button>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">📡 How K-R Uses Brain Data</div>
        {[
          {icon:"💬",text:"Every chat message is prefixed with your trading style, risk tolerance, and project context"},
          {icon:"⚡",text:"Power-Ups auto-load your exchange preferences and coin interests"},
          {icon:"📈",text:"Trade analysis factors in your risk tolerance and preferred timeframes"},
          {icon:"🔔",text:"Alerts are filtered to what's relevant for your specific exchanges"},
          {icon:"🧠",text:"Supabase saves your Brain Profile so K-R remembers you across sessions"},
        ].map((i,idx)=>(
          <div key={idx} className="mem-item">
            <span className="mem-ico">{i.icon}</span>
            <div className="mem-text">{i.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SETTINGS ──
function SettingsTab(){
  const [s,setS]=useState({voice:false,tts:true,notifications:true,autoSave:true,tradingConfirm:true,safeMode:true,darkMode:true});
  const tog=k=>setS(p=>({...p,[k]:!p[k]}));
  const ENVS=[
    {k:"GEMINI_API_KEY",v:"sk-•••••••••••••"},
    {k:"GEMINI_MODEL",v:"gemini-1.5-flash"},
    {k:"SUPABASE_URL",v:"https://xyz.supabase.co"},
    {k:"SUPABASE_SERVICE_ROLE_KEY",v:"eyJ•••"},
    {k:"JOIN_API_KEY",v:"••••••••••"},
    {k:"JOIN_DEVICE_ID",v:"•••••••••"},
    {k:"KR_LOCAL_MODEL_PRIMARY",v:"TheBloke/Mistral-7B-Instruct-v0.2-GGUF"},
    {k:"KR_LOCAL_MODEL_BACKUP",v:"GPT4All Falcon"},
    {k:"KR_LOCAL_MODEL_RUNNER",v:"GPT4All v3.10.0"},
    {k:"KR_LOCAL_MODEL_ENDPOINT",v:"http://localhost:4891/v1/chat/completions"},
  ];
  return(
    <div>
      <div className="card">
        <div className="card-title">⚙️ K-R Settings</div>
        {[
          {k:"tts",l:"Voice Output (TTS)",s:"K-R speaks responses aloud"},
          {k:"voice",l:"Voice Input",s:"Microphone wake word detection"},
          {k:"notifications",l:"Push Notifications",s:"System alerts and price warnings"},
          {k:"autoSave",l:"Auto-save to Memory",s:"Important chats saved to Supabase"},
          {k:"tradingConfirm",l:"Trade Confirmation Lock",s:"Always ask before any trade action"},
          {k:"safeMode",l:"Safe Mode",s:"Block risky commands without explicit OK"},
        ].map(r=>(
          <div key={r.k} className="srow">
            <div className="srow-info"><div className="slabel">{r.l}</div><div className="ssub">{r.s}</div></div>
            <label className="toggle"><input type="checkbox" checked={s[r.k]} onChange={()=>tog(r.k)}/><span className="ts"/></label>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">🧠 Local Offline Models</div>
        <div className="card-sub">Added from Dikong's GPT4All laptop setup. Model files stay on the laptop; Supabase/Vercel store only config names.</div>
        <div className="mem-item"><span className="mem-ico">⚡</span><div className="mem-text"><b>Mistral-7B-Instruct-v0.2-GGUF</b> — primary offline backup brain, q4_0, ~3.83 GB.</div></div>
        <div className="mem-item"><span className="mem-ico">🛡️</span><div className="mem-text"><b>GPT4All Falcon</b> — emergency backup model, 7B, q4_0, ~3.92 GB, 8 GB RAM.</div></div>
      </div>
      <div className="card">
        <div className="card-title">🔑 Vercel Environment Variables</div>
        <div className="card-sub">Set in Vercel Dashboard → Settings → Env Vars. Never exposed client-side.</div>
        {ENVS.map(e=>(
          <div key={e.k} className="env-item">
            <span className="env-k">{e.k}</span>
            <span className="env-v">{e.v}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">🚀 Deployment Guide</div>
        {SETUP_STEPS.map(s=>(
          <div key={s.num} className="setup-step">
            <div className="step-n">{s.num}</div>
            <div className="step-c">
              <div className="step-t">{s.title}</div>
              <div className="step-d">{s.desc}</div>
              <div className="code-blk">{s.code}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">🤖 K-R System Info</div>
        <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.8}}>
          {[["Version","K-R v2.0 — Jarvis Edition"],["Brain","Claude Sonnet 4 (Gemini on deploy)"],["Memory","Supabase PostgreSQL"],["Phone","Join → Tasker → AutoInput"],["Laptop","Python Agent (pyautogui)"],["Voice","Web Speech API + SpeechSynthesis"],["Modes","6 specialist modes"],["Power-Ups","12 one-tap tools"]].map(([k,v])=>(
            <div key={k}><span style={{color:"var(--cyan)"}}>{k}:</span> {v}</div>
          ))}
          <div style={{marginTop:10,padding:"8px 12px",background:"var(--bg3)",borderRadius:8,color:"var(--purple)",fontSize:11,fontFamily:"'JetBrains Mono',monospace",borderLeft:"2px solid var(--purple)"}}>
            "K-R is always honest about limits. K-R never pretends."
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
const TABS=[
  {id:"chat",    icon:"💬",label:"Chat"},
  {id:"powerups",icon:"⚡",label:"Powers"},
  {id:"tasks",   icon:"🎯",label:"Tasks"},
  {id:"devices", icon:"📡",label:"Devices"},
  {id:"trading", icon:"📈",label:"Trading"},
  {id:"memory",  icon:"🧠",label:"Memory"},
  {id:"brain",   icon:"🧬",label:"Brain"},
  {id:"settings",icon:"⚙️",label:"Settings"},

  { id:"live", icon:"🛰️", label:"Live" },
  { id:"v6", icon:"🧬", label:"V6" },
  { id:"v7", icon:"🛸", label:"V7" },
  { id:"v8", icon:"👁️", label:"V8" },
  { id:"v9", icon:"⚡", label:"V9" },
  { id:"v14", icon:"🧠", label:"V14" },
];
const MOBILE_TABS=["chat","powerups","tasks","trading","brain"];

export default function App(){
  const [tab,setTab]=useState("chat");
  const [memory,setMemory]=useState(MEMORY_SEED);
  const [brain,setBrain]=useState(BRAIN_DEFAULTS);

  const SYS_STATUS=[
    {label:"Brain",on:true},{label:"Memory",on:true},{label:"Phone",on:false},{label:"Laptop",on:false}
  ];

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            <div className="logo-icon">🤖</div>
            <span className="logo-text">K-R</span>
          </div>
          {TABS.map(t=>(
            <div key={t.id} className={`nav-item${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              <span className="ni">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
          <div className="sidebar-bottom">
            {SYS_STATUS.map(s=>(
              <div key={s.label} className="sys-dot">
                <div className={`dot${s.on?" dot-on":" dot-off"}`}/>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <div className="topbar-title">{TABS.find(t=>t.id===tab)?.icon} {TABS.find(t=>t.id===tab)?.label}</div>
              <div className="topbar-sub">/ K-R for Dikong / {fmtDate()}</div>
            </div>
            <div className="topbar-right">
              {SYS_STATUS.map(s=>(
                <div key={s.label} title={s.label} style={{width:8,height:8,borderRadius:"50%",background:s.on?"var(--green)":"var(--muted)",boxShadow:s.on?"0 0 6px var(--green)":"none"}}/>
              ))}
            </div>
          </div>
          <div className="content">
            {tab==="chat"    &&<ChatTab    memory={memory} setMemory={setMemory} brain={brain}/>}
            {tab==="powerups"&&<PowerUpsTab brain={brain}/>}
            {tab==="tasks"   &&<TasksTab/>}
            {tab==="devices" &&<DevicesTab setMemory={setMemory}/>}
            {tab==="trading" &&<TradingTab/>}
            {tab==="memory"  &&<MemoryTab  memory={memory} setMemory={setMemory}/>}
            {tab==="brain"   &&<BrainTab   brain={brain} setBrain={setBrain}/>}
            {tab==="settings"&&<SettingsTab/>}
            {tab === "v14" && <KRV14Addons/>}
            {tab==="live"&&<KRV5Addons/>}
            {tab==="v6"&&<KRV6Addons/>}
            {tab==="v7"&&<KRV7Addons/>}
            {tab==="v8"&&<KRV8Addons/>}
            {tab==="v9"&&<KRV9Addons/>}
          </div>
        </div>

        <nav className="bnav">
          {TABS.filter(t=>MOBILE_TABS.includes(t.id)).map(t=>(
            <div key={t.id} className={`bnav-item${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              <span className="bi">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
          <div className={`bnav-item${["devices","trading","memory","brain","settings"].includes(tab)?" active":""}`}
            onClick={()=>setTab(tab==="chat"?"devices":"devices")}>
            <span className="bi">⋯</span>
            <span>More</span>
          </div>
        </nav>
      </div>
    </>
  );
}
