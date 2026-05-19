import { useState, useMemo } from 'react';
import { IMGS } from './imgs';

/* ─── TYPES ── */
interface Attr { k: string; v: string; }
interface Listing { id:string; cat_slug:string; cat_name:string; title:string; body:string; price:string|null; is_free:boolean; condition:string; region:string; verified:boolean; created:string; seller:string; seller_av:string; img_key:string; extra_imgs:string[]; attrs:Attr[]; }
interface Category { id:string; name:string; slug:string; }
interface SortOption { v:string; l:string; }

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white:      #FFFFFF;
    --chalk:      #F8FAFC;
    --off-white:  #F0F4F8;
    --navy:       #0F2A4A;
    --navy-lt:    #1A3F6F;
    --indigo:     #1E3A8A;
    --blue:       #2563EB;
    --blue-lt:    #3B82F6;
    --cyan:       #0EA5E9;
    --slate:      #64748B;
    --slate-lt:   #94A3B8;
    --border:     #CBD5E1;
    --border-lt:  #E2E8F0;
    --shadow-blue: rgba(30,58,138,0.10);
    --shadow-deep: rgba(15,42,74,0.18);
  }

  html { font-size: 16px; scroll-behavior: smooth; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--chalk);
    color: var(--navy);
    -webkit-font-smoothing: antialiased;
  }

  /* NAVBAR */
  .navbar {
    background: var(--navy);
    position: sticky; top: 0; z-index: 100;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .nav-inner {
    max-width: 1400px; margin: 0 auto;
    display: flex; align-items: center; gap: 1.5rem;
    height: 64px; padding: 0 2rem;
  }
  .brand { display: flex; align-items: center; gap: 0; text-decoration: none; flex-shrink: 0; cursor: pointer; }
  .brand-snap {
    font-family: 'Playfair Display', serif;
    font-size: 1.55rem; font-weight: 600; color: #fff; letter-spacing: -0.5px;
  }
  .brand-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); margin: 0 1px 2px; }
  .brand-kampala {
    font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 300;
    letter-spacing: 0.2em; color: var(--slate-lt); text-transform: uppercase; padding-left: 4px;
  }
  .nav-search {
    flex: 1; max-width: 500px;
    display: flex; align-items: center; gap: 0.5rem;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px; padding: 0 0.5rem 0 1rem;
    transition: border-color 0.2s, background 0.2s;
  }
  .nav-search:focus-within { background: rgba(255,255,255,0.11); border-color: var(--cyan); }
  .nav-search input {
    flex: 1; background: none; border: none; outline: none;
    font-family: 'Inter', sans-serif; font-size: 0.875rem;
    color: #fff; padding: 0.6rem 0;
  }
  .nav-search input::placeholder { color: rgba(255,255,255,0.32); }
  .search-btn {
    background: var(--blue); color: #fff; border: none;
    padding: 0.38rem 1rem; border-radius: 6px; cursor: pointer;
    font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500;
    transition: background 0.2s; flex-shrink: 0;
  }
  .search-btn:hover { background: var(--blue-lt); }
  .nav-actions { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
  .btn-nav-ghost {
    background: none; border: 1px solid rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.75); padding: 0.42rem 1.1rem;
    border-radius: 6px; cursor: pointer; font-family: 'Inter', sans-serif;
    font-size: 0.83rem; font-weight: 400; transition: all 0.2s;
  }
  .btn-nav-ghost:hover { border-color: var(--cyan); color: #fff; }
  .btn-list {
    background: var(--cyan); color: var(--navy); border: none;
    padding: 0.48rem 1.2rem; border-radius: 6px; cursor: pointer;
    font-family: 'Inter', sans-serif; font-size: 0.83rem; font-weight: 600;
    transition: all 0.2s; letter-spacing: 0.01em;
  }
  .btn-list:hover { background: #38BDF8; transform: translateY(-1px); }

  /* HERO */
  .hero {
    background: linear-gradient(135deg, var(--navy) 0%, var(--indigo) 100%);
    padding: 2.5rem 2rem 2rem;
    text-align: center; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 60% 50%, rgba(14,165,233,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3);
    color: var(--cyan); font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 0.3rem 0.9rem; border-radius: 20px; margin-bottom: 1rem;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem; font-weight: 600; color: #fff;
    line-height: 1.2; margin-bottom: 0.6rem;
  }
  .hero h1 em { font-style: italic; color: var(--cyan); }
  .hero p {
    font-size: 0.9rem; color: rgba(255,255,255,0.55); max-width: 440px; margin: 0 auto 1.5rem;
  }
  .trust-row {
    display: flex; align-items: center; justify-content: center; gap: 1.5rem; flex-wrap: wrap;
  }
  .trust-item {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.75rem; color: rgba(255,255,255,0.5); font-weight: 400;
  }
  .trust-icon {
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(14,165,233,0.2); border: 1px solid rgba(14,165,233,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; color: var(--cyan);
  }

  /* CAT RAIL */
  .cat-rail {
    background: var(--white); border-bottom: 1px solid var(--border-lt);
    padding: 0.65rem 2rem; overflow-x: auto; scrollbar-width: none;
  }
  .cat-rail::-webkit-scrollbar { display: none; }
  .cat-rail-inner {
    max-width: 1400px; margin: 0 auto;
    display: flex; gap: 0.4rem; align-items: center;
  }
  .cat-chip {
    flex-shrink: 0; background: none; border: 1px solid var(--border);
    color: var(--slate); font-family: 'Inter', sans-serif;
    font-size: 0.78rem; font-weight: 400;
    padding: 0.35rem 0.95rem; border-radius: 20px; cursor: pointer;
    transition: all 0.15s; white-space: nowrap;
  }
  .cat-chip:hover { border-color: var(--blue-lt); color: var(--blue); background: rgba(59,130,246,0.04); }
  .cat-chip.active { background: var(--navy); border-color: var(--navy); color: #fff; }

  /* LAYOUT */
  .page-wrap {
    max-width: 1400px; margin: 0 auto;
    display: grid; grid-template-columns: 240px 1fr;
    gap: 2rem; padding: 2rem;
  }
  @media (max-width: 900px) {
    .page-wrap { grid-template-columns: 1fr; padding: 1rem; }
    .sidebar { display: none; }
    .sidebar.mobile-open { display: block; position: fixed; top: 0; left: 0; height: 100%; width: 290px; z-index: 200; overflow-y: auto; border-radius: 0; }
  }

  /* SIDEBAR */
  .sidebar {
    background: var(--white); border: 1px solid var(--border-lt);
    border-radius: 12px; padding: 1.5rem;
    position: sticky; top: 80px; height: fit-content;
  }
  .sidebar-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem; font-weight: 600; color: var(--navy);
    margin-bottom: 1.25rem; padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-lt);
  }
  .filter-sec { margin-bottom: 1.5rem; }
  .filter-lbl {
    font-size: 0.67rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--slate-lt); margin-bottom: 0.5rem;
  }
  .f-item {
    width: 100%; background: none; border: none; text-align: left;
    font-family: 'Inter', sans-serif; font-size: 0.83rem; color: var(--slate);
    padding: 0.42rem 0.65rem; border-radius: 6px; cursor: pointer; transition: all 0.13s;
  }
  .f-item:hover { background: var(--off-white); color: var(--navy); }
  .f-item.active { background: rgba(30,58,138,0.08); color: var(--indigo); font-weight: 500; }
  .loc-grid { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .loc-btn {
    background: none; border: 1px solid var(--border);
    font-family: 'Inter', sans-serif; font-size: 0.72rem; color: var(--slate);
    padding: 0.22rem 0.6rem; border-radius: 12px; cursor: pointer; transition: all 0.13s;
  }
  .loc-btn:hover { border-color: var(--blue-lt); color: var(--blue); }
  .loc-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; }
  .clear-lnk {
    background: none; border: none; font-size: 0.75rem;
    color: var(--blue); cursor: pointer; font-family: 'Inter', sans-serif;
    text-decoration: underline; margin-top: 0.5rem;
  }

  /* MAIN */
  .main { min-width: 0; }
  .results-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;
  }
  .results-label {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem; font-weight: 400; font-style: italic; color: var(--navy);
  }
  .mob-filter-btn {
    display: none; background: var(--navy); color: #fff;
    border: none; padding: 0.45rem 0.9rem; border-radius: 6px;
    font-family: 'Inter', sans-serif; font-size: 0.8rem; cursor: pointer;
    align-items: center; gap: 0.4rem;
  }
  @media (max-width: 900px) { .mob-filter-btn { display: flex; } }
  .chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.75rem; }
  .chip {
    display: inline-flex; align-items: center; gap: 0.35rem;
    background: rgba(30,58,138,0.07); border: 1px solid rgba(30,58,138,0.18);
    color: var(--indigo); font-size: 0.75rem; padding: 0.28rem 0.7rem; border-radius: 20px;
  }
  .chip button { background: none; border: none; cursor: pointer; color: var(--slate); font-size: 0.85rem; line-height:1; }

  /* GRID */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 1.25rem;
  }

  /* CARD */
  .card {
    background: var(--white);
    border: 1px solid var(--border-lt);
    border-radius: 12px; overflow: hidden; cursor: pointer;
    transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
    box-shadow: 0 2px 12px var(--shadow-blue);
  }
  .card:hover {
    box-shadow: 0 10px 36px var(--shadow-deep);
    transform: translateY(-4px);
    border-color: rgba(37,99,235,0.25);
  }
  .card-img {
    position: relative; aspect-ratio: 4/3; overflow: hidden;
    background: var(--off-white);
  }
  .card-img img { width:100%; height:100%; object-fit:cover; transition: transform 0.45s ease; }
  .card:hover .card-img img { transform: scale(1.05); }
  .card-badges { position: absolute; top: 0.6rem; left: 0.6rem; display: flex; gap: 0.3rem; }
  .badge-free {
    background: var(--cyan); color: var(--navy);
    font-size: 0.64rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 4px;
  }
  .badge-verified {
    background: var(--blue); color: #fff;
    font-size: 0.64rem; font-weight: 600; padding: 0.18rem 0.55rem;
    border-radius: 4px; display: flex; align-items: center; gap: 0.22rem;
  }
  .card-body { padding: 0.85rem 1rem 1rem; }
  .card-cat {
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--blue); margin-bottom: 0.28rem;
  }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 0.98rem; font-weight: 600; line-height: 1.3;
    color: var(--navy); margin-bottom: 0.45rem;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .card-seller {
    display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.55rem;
  }
  .av-sm {
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--off-white); border: 1.5px solid var(--border);
    overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; font-weight: 600; color: var(--navy);
  }
  .av-sm img { width:100%; height:100%; object-fit:cover; }
  .seller-txt { font-size: 0.72rem; color: var(--slate); }
  .v-dot { color: var(--blue); font-size: 0.68rem; }
  .card-foot { display: flex; align-items: flex-end; justify-content: space-between; }
  .price {
    font-family: 'Playfair Display', serif;
    font-size: 1.08rem; font-weight: 600; color: var(--navy);
  }
  .price.free { color: var(--cyan); }
  .meta { font-size: 0.68rem; color: var(--slate-lt); text-align: right; }

  /* EMPTY */
  .empty { text-align: center; padding: 4rem 2rem; }
  .empty h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 400; font-style: italic; color: var(--navy); }
  .empty p { font-size: 0.85rem; color: var(--slate); margin-top: 0.4rem; }
  .btn-clear-empty { margin-top: 1.25rem; background: var(--navy); color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; font-family: 'Inter', sans-serif; cursor: pointer; }

  /* DETAIL OVERLAY */
  .overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(10,20,40,0.65); backdrop-filter: blur(4px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 1.5rem 1rem; overflow-y: auto;
    animation: fIn 0.2s ease;
  }
  @keyframes fIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--white); border-radius: 16px;
    width: 100%; max-width: 940px;
    box-shadow: 0 32px 80px rgba(10,20,40,0.4);
    overflow: hidden; animation: sUp 0.26s ease;
  }
  @keyframes sUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.9rem 1.5rem;
    background: var(--navy); border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .modal-close {
    background: rgba(255,255,255,0.08); border: none; color: #fff;
    width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
    font-size: 1rem; display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .modal-close:hover { background: rgba(255,255,255,0.18); }
  .modal-body { display: grid; grid-template-columns: 1fr 320px; }
  @media (max-width: 680px) {
    .modal-body { grid-template-columns: 1fr; }
    .modal-right { border-left: none; border-top: 1px solid var(--border-lt); }
  }
  .modal-left { padding: 1.5rem; }
  .gallery { border-radius: 10px; overflow: hidden; background: var(--off-white); aspect-ratio: 4/3; }
  .gallery img { width:100%; height:100%; object-fit:cover; }
  .thumbs { display: flex; gap: 0.5rem; margin-top: 0.65rem; }
  .thumb { width: 62px; height: 46px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.15s; }
  .thumb.act { border-color: var(--blue); }
  .thumb img { width:100%; height:100%; object-fit:cover; }
  .detail-sec { margin-top: 1.4rem; }
  .detail-sec-title {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--blue); margin-bottom: 0.6rem;
  }
  .detail-body-text { font-size: 0.875rem; line-height: 1.75; color: #334155; }
  .attr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  .attr-row {
    background: var(--off-white); border-radius: 6px;
    padding: 0.4rem 0.7rem; font-size: 0.78rem;
    display: flex; justify-content: space-between; gap: 0.5rem;
    border: 1px solid var(--border-lt);
  }
  .ak { color: var(--slate); } .av { color: var(--navy); font-weight: 500; }
  .modal-right {
    border-left: 1px solid var(--border-lt);
    padding: 1.5rem; display: flex; flex-direction: column; gap: 1.1rem;
  }
  .d-badges { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .d-badge {
    font-size: 0.7rem; padding: 0.22rem 0.7rem; border-radius: 20px;
    background: var(--off-white); border: 1px solid var(--border); color: var(--slate);
  }
  .d-badge.condition { background: rgba(30,58,138,0.06); border-color: rgba(30,58,138,0.2); color: var(--indigo); }
  .d-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 600; line-height: 1.25; color: var(--navy);
  }
  .d-price {
    font-family: 'Playfair Display', serif;
    font-size: 1.85rem; font-weight: 600; color: var(--navy);
  }
  .d-price.free { color: var(--cyan); }
  .d-meta { display: flex; flex-direction: column; gap: 0.3rem; }
  .d-meta span { font-size: 0.78rem; color: var(--slate); display: flex; align-items: center; gap: 0.4rem; }
  .seller-card {
    background: var(--off-white); border: 1px solid var(--border-lt);
    border-radius: 10px; padding: 1rem;
    display: flex; align-items: center; gap: 0.75rem;
  }
  .av-lg {
    width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
    background: var(--white); border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; font-weight: 600; color: var(--navy); flex-shrink: 0;
  }
  .av-lg img { width:100%; height:100%; object-fit:cover; }
  .s-info { flex:1; min-width:0; }
  .s-lbl { font-size: 0.65rem; color: var(--slate-lt); letter-spacing: 0.07em; text-transform: uppercase; }
  .s-name { font-size: 0.9rem; font-weight: 500; color: var(--navy); }
  .v-badge {
    display: inline-flex; align-items: center; gap: 0.25rem;
    background: var(--blue); color: #fff;
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.04em;
    padding: 0.18rem 0.55rem; border-radius: 20px; margin-top: 0.2rem;
  }
  .secure-banner {
    background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
    border: 1px solid #BFDBFE; border-radius: 8px;
    padding: 0.75rem; font-size: 0.76rem; color: var(--indigo);
    display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.5;
  }
  .chat-bubble-row { display: flex; flex-direction: column; gap: 0.4rem; }
  .bubble {
    padding: 0.5rem 0.8rem; border-radius: 12px;
    font-size: 0.78rem; max-width: 85%;
  }
  .bubble.seller { background: rgba(37,99,235,0.1); color: var(--indigo); border: 1px solid rgba(37,99,235,0.18); align-self: flex-start; border-bottom-left-radius: 3px; }
  .bubble.buyer { background: var(--white); color: var(--navy); border: 1.5px solid var(--navy); align-self: flex-end; border-bottom-right-radius: 3px; }
  .btn-contact {
    background: var(--navy); color: #fff; border: none;
    border-radius: 8px; padding: 0.82rem;
    font-family: 'Inter', sans-serif; font-size: 0.88rem; font-weight: 500;
    cursor: pointer; width: 100%; transition: background 0.2s; letter-spacing: 0.01em;
  }
  .btn-contact:hover { background: var(--indigo); }
  .msg-sent-box {
    background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;
    padding: 0.85rem; text-align: center;
    color: var(--blue); font-size: 0.86rem; font-weight: 500;
  }

  /* FOOTER */
  .footer {
    background: var(--navy); color: rgba(255,255,255,0.35);
    text-align: center; padding: 2rem;
    font-size: 0.76rem; margin-top: 4rem;
  }
  .footer strong { color: var(--cyan); }

  .backdrop-mob { position: fixed; inset: 0; z-index: 190; background: rgba(10,20,40,0.4); }
`;

/* ── DATA ── */
const CATS: Category[] = [
  {id:'c1',name:'Sofas & Seating',   slug:'sofas'  },
  {id:'c2',name:'Beds & Mattresses', slug:'beds'   },
  {id:'c3',name:'Tables & Chairs',   slug:'tables' },
  {id:'c4',name:'Storage & Cabinets',slug:'storage'},
  {id:'c5',name:'Office Furniture',  slug:'office' },
  {id:'c6',name:'Outdoor Furniture', slug:'outdoor'},
  {id:'c7',name:'Decor & Accents',   slug:'decor'  },
  {id:'c8',name:'Free',              slug:'free'   },
];
const LOCS: string[] = ['Ntinda','Kololo','Bukoto','Kira','Nakasero','Muyenga','Naguru','Bugolobi','Makindye','Kamwokya','Rubaga'];
const SORT_OPTS: SortOption[] = [
  {v:'newest',    l:'Newest first'      },
  {v:'price_asc', l:'Price: low → high' },
  {v:'price_desc',l:'Price: high → low' },
];
const COND_LBL: Record<string, string> = {new:'New',like_new:'Like New',good:'Good',fair:'Fair',parts:'For Parts'};

const LISTINGS: Listing[] = [
  {
    id:'l1', cat_slug:'sofas', cat_name:'Sofas & Seating',
    title:'5-Seater Sofa Set — Grey Fabric, 3+1+1 Configuration',
    body:'A full 5-seater sofa set in durable grey and cream fabric. Includes a 3-seater plus two single recliners. Solid hardwood frame with foam cushions. Ideal for a family sitting room. Minor surface wear on one armrest, otherwise in great condition.',
    price:'1150000', is_free:false, condition:'good',
    region:'Ntinda', verified:true,
    created:'2026-05-10T09:00:00Z',
    seller:'Jane Nakato', seller_av:'https://i.pravatar.cc/80?img=47',
    img_key:'download', extra_imgs:['download_3'],
    attrs:[{k:'Configuration',v:'3+1+1'},{k:'Material',v:'Fabric'},{k:'Color',v:'Grey & Cream'},{k:'Frame',v:'Hardwood'}],
  },
  {
    id:'l2', cat_slug:'tables', cat_name:'Tables & Chairs',
    title:'Mid-Century Round Dining Table + 4 Chairs',
    body:'Classic mid-century teak round dining table paired with 4 matching chairs. Beautiful warm wood tones. Also includes a wall-mounted teak cabinet in matching finish. Perfect for a Scandinavian-inspired dining room. Self-collection only.',
    price:'980000', is_free:false, condition:'good',
    region:'Kololo', verified:true,
    created:'2026-05-12T10:00:00Z',
    seller:'David Ssempa', seller_av:'https://i.pravatar.cc/80?img=12',
    img_key:'download_1', extra_imgs:[],
    attrs:[{k:'Style',v:'Mid-Century'},{k:'Material',v:'Teak'},{k:'Includes',v:'Cabinet + Chairs'},{k:'Collection',v:'Self-collect'}],
  },
  {
    id:'l3', cat_slug:'sofas', cat_name:'Sofas & Seating',
    title:'7-Piece Cream Leather Sofa Set — 3+2+1+1',
    body:'Luxurious full cream leather sofa set, 7 pieces total: 3-seater, 2-seater, and two single armchairs. Soft leather upholstery, plush cushioning. Excellent condition — no tears, no stains. Selling because upgrading to a sectional.',
    price:'2400000', is_free:false, condition:'like_new',
    region:'Nakasero', verified:true,
    created:'2026-05-13T08:00:00Z',
    seller:'Grace Tendo', seller_av:'https://i.pravatar.cc/80?img=44',
    img_key:'download_3', extra_imgs:['download'],
    attrs:[{k:'Pieces',v:'7 (3+2+1+1)'},{k:'Material',v:'Faux Leather'},{k:'Color',v:'Cream/Beige'},{k:'Condition',v:'Like New'}],
  },
  {
    id:'l4', cat_slug:'tables', cat_name:'Tables & Chairs',
    title:'Solid Wood Dining Table — 8 Seater, Dark Mahogany',
    body:'A commanding 8-seater dining table in solid dark mahogany wood. Rich, warm grain with 8 matching high-back chairs. Sturdy and heavy — serious piece of furniture. Some surface scratches that add character. Measured 200cm × 95cm.',
    price:'1800000', is_free:false, condition:'good',
    region:'Muyenga', verified:false,
    created:'2026-05-14T14:00:00Z',
    seller:'Prosper Mugisha', seller_av:'https://i.pravatar.cc/80?img=33',
    img_key:'download_4', extra_imgs:[],
    attrs:[{k:'Seats',v:'8'},{k:'Material',v:'Solid Mahogany'},{k:'Size',v:'200×95cm'},{k:'Chairs',v:'8 included'}],
  },
  {
    id:'l5', cat_slug:'storage', cat_name:'Storage & Cabinets',
    title:'Ornate Carved Wood Display Cabinet — Antique Style',
    body:'A stunning antique-style hand-carved display cabinet with open shelving. Intricate floral and scroll carvings on the crown and doors. Deep natural wood finish. Ideal as a bookcase, display unit, or statement piece. Rare find in Kampala.',
    price:'1350000', is_free:false, condition:'good',
    region:'Bukoto', verified:true,
    created:'2026-05-15T11:00:00Z',
    seller:'Aisha Nalwoga', seller_av:'https://i.pravatar.cc/80?img=25',
    img_key:'images', extra_imgs:[],
    attrs:[{k:'Style',v:'Antique Carved'},{k:'Material',v:'Solid Wood'},{k:'Shelves',v:'3 open'},{k:'Feature',v:'Hand-carved detail'}],
  },
  {
    id:'l6', cat_slug:'sofas', cat_name:'Sofas & Seating',
    title:'Vintage Chesterfield Sofa — Burgundy Damask, Gold Fringe',
    body:'An absolutely unique vintage Chesterfield-style long sofa. Deep button tufting in a rich burgundy and gold damask fabric with decorative gold fringe trim along the base. A true statement piece — perfect for a bold, dramatic living space or studio.',
    price:'750000', is_free:false, condition:'fair',
    region:'Naguru', verified:false,
    created:'2026-05-15T15:00:00Z',
    seller:'Robert Okello', seller_av:'https://i.pravatar.cc/80?img=18',
    img_key:'images_1', extra_imgs:['images_2'],
    attrs:[{k:'Style',v:'Chesterfield'},{k:'Fabric',v:'Damask'},{k:'Color',v:'Burgundy & Gold'},{k:'Length',v:'Approx 2.5m'}],
  },
  {
    id:'l7', cat_slug:'sofas', cat_name:'Sofas & Seating',
    title:'Floral Velvet 5-Seater Sofa Set — 3+2 Configuration',
    body:'Rich brown velvet sofa set with golden floral print and matching cushions. 3-seater and 2-seater combo. Solid wooden base. Plush, deep cushioning — very comfortable. Some normal wear on the armrests. Based in Kamwokya.',
    price:'870000', is_free:false, condition:'good',
    region:'Kamwokya', verified:true,
    created:'2026-05-16T09:00:00Z',
    seller:'Hassan Kato', seller_av:'https://i.pravatar.cc/80?img=8',
    img_key:'images_2', extra_imgs:['images_1'],
    attrs:[{k:'Configuration',v:'3+2'},{k:'Fabric',v:'Velvet'},{k:'Color',v:'Brown & Gold'},{k:'Cushions',v:'Included'}],
  },
  {
    id:'l8', cat_slug:'sofas', cat_name:'Sofas & Seating',
    title:'Teal L-Shaped Corner Sectional Sofa',
    body:'Modern corner sectional in teal/dark turquoise velvet upholstery. L-shape configuration fits perfectly in a corner. Two-piece design that can be separated. Minor fabric pilling but structurally excellent. Based in Kira.',
    price:'650000', is_free:false, condition:'fair',
    region:'Kira', verified:true,
    created:'2026-05-16T12:00:00Z',
    seller:'Lydia Birungi', seller_av:'https://i.pravatar.cc/80?img=56',
    img_key:'images_4', extra_imgs:[],
    attrs:[{k:'Shape',v:'L-Shaped'},{k:'Color',v:'Teal'},{k:'Fabric',v:'Velvet'},{k:'Separable',v:'Yes'}],
  },
  {
    id:'l9', cat_slug:'beds', cat_name:'Beds & Mattresses',
    title:'Pair of Mahogany Bedside Tables — 2 Drawers Each',
    body:'Matching pair of dark mahogany bedside cabinets, each with 2 drawers and solid brass pull handles. Sturdy and well-made. Louis Philippe style curved details on the base. Sold as a pair only. Perfect with a king or queen bed.',
    price:'480000', is_free:false, condition:'good',
    region:'Bugolobi', verified:false,
    created:'2026-05-17T07:00:00Z',
    seller:'Patrick Onen', seller_av:'https://i.pravatar.cc/80?img=52',
    img_key:'images_5', extra_imgs:[],
    attrs:[{k:'Sold as',v:'Pair'},{k:'Material',v:'Mahogany'},{k:'Drawers',v:'2 each'},{k:'Style',v:'Louis Philippe'}],
  },
  {
    id:'l10', cat_slug:'beds', cat_name:'Beds & Mattresses',
    title:'Black Leather Sofa-Cum-Bed — Pull-Out Daybed',
    body:'Multifunctional black faux-leather sofa that converts into a single pull-out bed. Perfect for a guest room or studio apartment. Includes matching cushions. Mechanism works smoothly. Very space-efficient.',
    price:'560000', is_free:false, condition:'good',
    region:'Makindye', verified:true,
    created:'2026-05-17T08:00:00Z',
    seller:'Diana Namutebi', seller_av:'https://i.pravatar.cc/80?img=32',
    img_key:'images_6', extra_imgs:[],
    attrs:[{k:'Type',v:'Sofa + Bed'},{k:'Material',v:'Faux Leather'},{k:'Color',v:'Black'},{k:'Size',v:'Single bed'}],
  },
  {
    id:'l11', cat_slug:'tables', cat_name:'Tables & Chairs',
    title:'Mahogany Coffee Table with Lower Shelf',
    body:'Solid mahogany rectangular coffee table with a lower display shelf. Deep red-brown finish. Simple, clean lines — works in both traditional and modern interiors. Excellent condition, no scratches on the surface.',
    price:'290000', is_free:false, condition:'like_new',
    region:'Rubaga', verified:false,
    created:'2026-05-17T09:00:00Z',
    seller:'Sarah Akello', seller_av:'https://i.pravatar.cc/80?img=38',
    img_key:'images_7', extra_imgs:[],
    attrs:[{k:'Material',v:'Mahogany'},{k:'Feature',v:'Lower shelf'},{k:'Finish',v:'Lacquered'},{k:'Condition',v:'Like New'}],
  },
  {
    id:'l12', cat_slug:'office', cat_name:'Office Furniture',
    title:'Retro Secretary Desk — Orange & White, 3 Cabinets',
    body:'Characterful retro-style office desk with orange and white laminate finish. Three cabinet doors with chrome pulls plus a central drawer. Solid build. Perfect for a home office with a vintage or playful aesthetic. Self-collection.',
    price:'320000', is_free:false, condition:'fair',
    region:'Ntinda', verified:true,
    created:'2026-05-17T10:00:00Z',
    seller:'Jane Nakato', seller_av:'https://i.pravatar.cc/80?img=47',
    img_key:'images_8', extra_imgs:[],
    attrs:[{k:'Style',v:'Retro/Secretary'},{k:'Color',v:'Orange & White'},{k:'Cabinets',v:'3 doors'},{k:'Collection',v:'Self-collect'}],
  },
  {
    id:'l13', cat_slug:'storage', cat_name:'Storage & Cabinets',
    title:'Designer Stripe Chest of Drawers — Monochrome Statement',
    body:'A striking monochrome stripe-painted chest of drawers with Louis XVI cabriole legs. 4 wide drawers with ample storage. An interior designer\'s statement piece that works in a bedroom, hallway, or living area. Excellent condition.',
    price:'680000', is_free:false, condition:'like_new',
    region:'Kololo', verified:true,
    created:'2026-05-17T11:00:00Z',
    seller:'David Ssempa', seller_av:'https://i.pravatar.cc/80?img=12',
    img_key:'images_9', extra_imgs:[],
    attrs:[{k:'Style',v:'Statement/Designer'},{k:'Pattern',v:'Monochrome Stripe'},{k:'Drawers',v:'4'},{k:'Legs',v:'Cabriole'}],
  },
  {
    id:'l14', cat_slug:'outdoor', cat_name:'Outdoor Furniture',
    title:'Cast Iron Garden Benches — Pair, Classic Style',
    body:'Two matching classic cast iron and wood slat garden benches. Heavy-duty cast iron ornamental frames in black, with natural wood slat seats and backs. Perfect for a garden, veranda, or compound. Some surface rust on the iron — adds character.',
    price:'420000', is_free:false, condition:'fair',
    region:'Muyenga', verified:false,
    created:'2026-05-17T12:00:00Z',
    seller:'Grace Tendo', seller_av:'https://i.pravatar.cc/80?img=44',
    img_key:'images_10', extra_imgs:['images_11'],
    attrs:[{k:'Sold as',v:'Pair'},{k:'Frame',v:'Cast Iron'},{k:'Seat',v:'Wood Slats'},{k:'Style',v:'Classic Garden'}],
  },
  {
    id:'l15', cat_slug:'outdoor', cat_name:'Outdoor Furniture',
    title:'Handmade Wooden Double Chair Bench with Centre Table',
    body:'Beautifully handcrafted solid wood outdoor double seat bench with an integrated centre table. Two individual high-back chairs connected by a shared coffee table. Ideal for a garden, terrace, or veranda. Natural wood finish. Ready to use.',
    price:'550000', is_free:false, condition:'good',
    region:'Naguru', verified:true,
    created:'2026-05-17T13:00:00Z',
    seller:'Aisha Nalwoga', seller_av:'https://i.pravatar.cc/80?img=25',
    img_key:'images_11', extra_imgs:['images_10'],
    attrs:[{k:'Material',v:'Solid Wood'},{k:'Type',v:'2 seats + table'},{k:'Finish',v:'Natural'},{k:'Made',v:'Handcrafted'}],
  },
  {
    id:'l16', cat_slug:'free', cat_name:'Free',
    title:'Free — Assorted Stools & Side Chairs Collection',
    body:'A mixed collection of stools and side chairs — various heights, styles and materials. Some need minor repairs. Great for a workshop, studio or DIY restorer. Over 10 pieces available. First come, first served. Self-collection Makindye.',
    price:null, is_free:true, condition:'fair',
    region:'Makindye', verified:false,
    created:'2026-05-17T14:00:00Z',
    seller:'Prosper Mugisha', seller_av:'https://i.pravatar.cc/80?img=33',
    img_key:'download_5', extra_imgs:[],
    attrs:[{k:'Pieces',v:'10+'},{k:'Condition',v:'Mixed'},{k:'Collection',v:'Makindye only'},{k:'DIY',v:'Some repairs needed'}],
  },
];

function fmt(price: string | null, isFree: boolean): string {
  if (isFree) return 'Free';
  if (!price) return 'Negotiable';
  return `UGX ${parseInt(price).toLocaleString()}`;
}
function ago(date: string): string {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Today'; if (d === 1) return 'Yesterday'; return `${d}d ago`;
}

function ShieldIcon() {
  return (
    <svg width="8" height="9" viewBox="0 0 10 12" fill="none">
      <path d="M5 0L10 2.5V6C10 9 5 12 5 12C5 12 0 9 0 6V2.5L5 0Z" fill="currentColor" fillOpacity="0.9"/>
    </svg>
  );
}

interface SidebarProps { sort:string; setSort:(v:string)=>void; category:string; setCategory:(v:string)=>void; location:string; setLocation:(v:string)=>void; }
function SidebarInner({ sort, setSort, category, setCategory, location, setLocation }: SidebarProps) {
  return (
    <>
      <div className="sidebar-title">Refine Gallery</div>
      {(category || location) && (
        <button className="clear-lnk" onClick={() => { setCategory(''); setLocation(''); }}>
          Clear all filters
        </button>
      )}
      <div className="filter-sec" style={{marginTop: (category || location) ? '0.75rem' : 0}}>
        <div className="filter-lbl">Sort by</div>
        {SORT_OPTS.map(o => (
          <button key={o.v} className={`f-item ${sort===o.v?'active':''}`} onClick={() => setSort(o.v)}>{o.l}</button>
        ))}
      </div>
      <div className="filter-sec">
        <div className="filter-lbl">Category</div>
        <button className={`f-item ${!category?'active':''}`} onClick={() => setCategory('')}>All pieces</button>
        {CATS.map(c => (
          <button key={c.id} className={`f-item ${category===c.slug?'active':''}`}
            onClick={() => setCategory(c.slug===category?'':c.slug)}>{c.name}</button>
        ))}
      </div>
      <div className="filter-sec">
        <div className="filter-lbl">Neighbourhood</div>
        <div className="loc-grid">
          {LOCS.map(l => (
            <button key={l} className={`loc-btn ${location===l?'active':''}`}
              onClick={() => setLocation(l===location?'':l)}>{l}</button>
          ))}
        </div>
      </div>
    </>
  );
}

interface CardProps { listing:Listing; onClick:(l:Listing)=>void; }
function Card({ listing, onClick }: CardProps) {
  return (
    <div className="card" onClick={() => onClick(listing)}>
      <div className="card-img">
        <img src={IMGS[listing.img_key]} alt={listing.title} loading="lazy" />
        <div className="card-badges">
          {listing.is_free && <span className="badge-free">Free</span>}
          {listing.verified && (
            <span className="badge-verified"><ShieldIcon /> Verified</span>
          )}
        </div>
      </div>
      <div className="card-body">
        <p className="card-cat">{listing.cat_name}</p>
        <h3 className="card-title">{listing.title}</h3>
        <div className="card-seller">
          <div className="av-sm">
            <img src={listing.seller_av} alt={listing.seller} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <span className="seller-txt">{listing.seller}</span>
          {listing.verified && <span className="v-dot">✦</span>}
        </div>
        <div className="card-foot">
          <span className={`price ${listing.is_free?'free':''}`}>{fmt(listing.price, listing.is_free)}</span>
          <span className="meta">{listing.region} · {ago(listing.created)}</span>
        </div>
      </div>
    </div>
  );
}

interface DetailProps { listing:Listing; onClose:()=>void; }
function Detail({ listing, onClose }: DetailProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [msgSent, setMsgSent] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const allImgs = [listing.img_key, ...(listing.extra_imgs || [])];

  return (
    <div className="overlay" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('overlay')) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div className="brand">
            <span className="brand-snap">Snap</span>
            <span className="brand-dot" />
            <span className="brand-kampala">Kampala</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-left">
            <div className="gallery">
              <img src={IMGS[allImgs[activeImg]]} alt={listing.title} />
            </div>
            {allImgs.length > 1 && (
              <div className="thumbs">
                {allImgs.map((k, i) => (
                  <div key={i} className={`thumb ${i===activeImg?'act':''}`} onClick={() => setActiveImg(i)}>
                    <img src={IMGS[k]} alt="" />
                  </div>
                ))}
              </div>
            )}
            <div className="detail-sec">
              <div className="detail-sec-title">About This Piece</div>
              <p className="detail-body-text">{listing.body}</p>
            </div>
            {listing.attrs?.length > 0 && (
              <div className="detail-sec">
                <div className="detail-sec-title">Specifications</div>
                <div className="attr-grid">
                  {listing.attrs.map(a => (
                    <div key={a.k} className="attr-row">
                      <span className="ak">{a.k}</span>
                      <span className="av">{a.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-right">
            <div className="d-badges">
              <span className="d-badge">{listing.cat_name}</span>
              {listing.condition && <span className="d-badge condition">{COND_LBL[listing.condition]}</span>}
              {listing.verified && (
                <span style={{background:'rgba(37,99,235,0.1)',border:'1px solid rgba(37,99,235,0.25)',color:'var(--blue)',fontSize:'0.68rem',padding:'0.2rem 0.65rem',borderRadius:'20px',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                  <ShieldIcon /> Identity Confirmed
                </span>
              )}
            </div>

            <h1 className="d-title">{listing.title}</h1>

            <div className={`d-price ${listing.is_free?'free':''}`}>
              {fmt(listing.price, listing.is_free)}
            </div>

            <div className="d-meta">
              <span>📍 {listing.region}, Kampala</span>
              <span>🕐 Listed {new Date(listing.created).toLocaleDateString('en-UG',{day:'numeric',month:'long',year:'numeric'})}</span>
            </div>

            <div className="seller-card">
              <div className="av-lg">
                <img src={listing.seller_av} alt={listing.seller} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="s-info">
                <div className="s-lbl">Listed by</div>
                <div className="s-name">{listing.seller}</div>
                {listing.verified && (
                  <span className="v-badge"><ShieldIcon /> Hand-Verified Seller</span>
                )}
              </div>
            </div>

            <div className="secure-banner">
              <span>💬</span>
              <span>You are chatting in a verified, secure blue-space. Seller identity confirmed.</span>
            </div>

            {showChat && !msgSent && (
              <div className="chat-bubble-row">
                <div className="bubble seller">Hi! Still available? 😊</div>
                <div className="bubble buyer">Yes — are you interested?</div>
              </div>
            )}

            {msgSent ? (
              <div className="msg-sent-box">
                ✓ Message sent to {listing.seller.split(' ')[0]}!<br/>
                <span style={{fontSize:'0.72rem',color:'var(--slate)',marginTop:'0.3rem',display:'block'}}>You'll hear back through our secure channel.</span>
              </div>
            ) : (
              <button className="btn-contact" onClick={() => { setShowChat(true); setTimeout(() => setMsgSent(true), 1800); }}>
                Contact {listing.seller.split(' ')[0]} securely
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [q, setQ]           = useState('');
  const [input, setInput]   = useState('');
  const [cat, setCat]       = useState('');
  const [loc, setLoc]       = useState('');
  const [sort, setSort]     = useState('newest');
  const [sel, setSel]       = useState<Listing | null>(null);
  const [drawer, setDrawer] = useState(false);

  function handleSearch() { setQ(input); }

  const filtered = useMemo(() => {
    let list = [...LISTINGS];
    if (q) list = list.filter(l => l.title.toLowerCase().includes(q.toLowerCase()) || l.body.toLowerCase().includes(q.toLowerCase()));
    if (cat) list = list.filter(l => l.cat_slug === cat);
    if (loc) list = list.filter(l => l.region === loc);
    if (sort === 'price_asc') list.sort((a,b) => parseFloat(a.price ?? '0') - parseFloat(b.price ?? '0'));
    else if (sort === 'price_desc') list.sort((a,b) => parseFloat(b.price ?? '0') - parseFloat(a.price ?? '0'));
    else list.sort((a,b) => new Date(b.created).getTime()-new Date(a.created).getTime());
    return list;
  }, [q, cat, loc, sort]);

  return (
    <>
      <style>{css}</style>

      <nav className="navbar">
        <div className="nav-inner">
          <div className="brand" onClick={() => { setQ(''); setInput(''); setCat(''); setLoc(''); }}>
            <span className="brand-snap">Snap</span>
            <span className="brand-dot" />
            <span className="brand-kampala">Kampala</span>
          </div>
          <div className="nav-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" style={{flexShrink:0}}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search trusted, verified furniture…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setQ(input); }}
            />
            {input && <button style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'1rem'}} onClick={()=>{setInput('');setQ('');}}>×</button>}
            <button className="search-btn" onClick={handleSearch}>Search</button>
          </div>
          <div className="nav-actions">
            <button className="btn-nav-ghost">Sign in</button>
            <button className="btn-list">+ List a piece</button>
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-tag">✦ The Pristine Gallery</div>
        <h1>Clear spaces.<br/><em>Trusted pieces.</em></h1>
        <p>Connecting you safely with verified local sellers across Kampala.</p>
        <div className="trust-row">
          {[['🛡','Verified Sellers'],['💬','Secure Messaging'],['📍','Kampala-Wide'],['✨','Curated Quality']].map(([icon,label]) => (
            <div key={label} className="trust-item">
              <div className="trust-icon">{icon}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cat-rail">
        <div className="cat-rail-inner">
          <button className={`cat-chip ${!cat?'active':''}`} onClick={() => setCat('')}>All pieces</button>
          {CATS.map(c => (
            <button key={c.id} className={`cat-chip ${cat===c.slug?'active':''}`}
              onClick={() => setCat(c.slug===cat?'':c.slug)}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="page-wrap">
        <aside className={`sidebar ${drawer?'mobile-open':''}`}>
          <SidebarInner sort={sort} setSort={setSort} category={cat} setCategory={setCat} location={loc} setLocation={setLoc} />
          {drawer && (
            <button className="btn-list" style={{width:'100%',marginTop:'1.5rem',padding:'0.75rem',borderRadius:'6px'}} onClick={()=>setDrawer(false)}>
              Show {filtered.length} results
            </button>
          )}
        </aside>

        {drawer && <div className="backdrop-mob" onClick={() => setDrawer(false)} />}

        <main className="main">
          <div className="results-bar">
            <span className="results-label">
              {filtered.length} {filtered.length===1?'piece':'pieces'}{q?` matching "${q}"`:''}
            </span>
            <button className="mob-filter-btn" onClick={() => setDrawer(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
            </button>
          </div>

          {(q || cat || loc) && (
            <div className="chips">
              {q && <span className="chip">"{q}" <button onClick={()=>{setQ('');setInput('');}}>×</button></span>}
              {cat && <span className="chip">{CATS.find(c=>c.slug===cat)?.name} <button onClick={()=>setCat('')}>×</button></span>}
              {loc && <span className="chip">{loc} <button onClick={()=>setLoc('')}>×</button></span>}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty">
              <h3>No pieces found…</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="btn-clear-empty" onClick={()=>{setQ('');setInput('');setCat('');setLoc('');}}>Clear filters</button>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((l: Listing) => <Card key={l.id} listing={l} onClick={setSel} />)}
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        <strong>Snap·Kampala</strong> — Clear spaces. Trusted pieces. Safe transactions. &nbsp;·&nbsp; Kampala, Uganda
      </footer>

      {sel && <Detail listing={sel} onClose={() => setSel(null)} />}
    </>
  );
}
