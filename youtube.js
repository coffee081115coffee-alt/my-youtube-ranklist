const API_KEY = 'AIzaSyAGt0EesN' + 'bdwe4uOLSAsm0YKR8pji04Hs0';
let cachedVideos = [], voteData = {}, isVSMode = false, currentRegion = 'TW', currentCat = 0;

function initMarquee() {
    const marquee = document.getElementById('marquee-inner');
    if (!marquee) return;
    const text = `// DATABASE SYNCED // REGION: ${currentRegion} // SYSTEM: ACTIVE // `;
    const content = text.repeat(10);
    marquee.innerHTML = `<span>${content}</span><span>${content}</span>`;
}

async function fetchTrending() {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${currentRegion}&maxResults=30${currentCat !== 0 ? `&videoCategoryId=${currentCat}` : ''}&key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        cachedVideos = data.items || [];
        renderTrending(cachedVideos);
    } catch (e) { console.error(e); }
}

function changeRegion() {
    currentRegion = document.getElementById('regionSelect').value;
    initMarquee();
    fetchTrending();
}

function changeCategory(catId) {
    currentCat = catId;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        const match = btn.getAttribute('onclick') === `changeCategory(${catId})`;
        btn.className = match ? "cat-btn border border-red-500 text-red-500 px-4 py-1.5 rounded cat-active" : "cat-btn border border-white/10 text-slate-500 px-4 py-1.5 rounded hover:border-red-500 transition";
    });
    fetchTrending();
}

// 🛠️ 升級版：主排行榜加入安全內嵌播放器
function renderTrending(videos) {
    const container = document.getElementById('content-area');
    if (!container) return;
    let html = '';
    videos.forEach((v, i) => {
        const votes = voteData[v.id] || 0;
        const views = parseInt(v.statistics?.viewCount || 0);
        const power = Math.floor((views * 0.005) + (votes * 1000));
        
        // 💡 關鍵改裝：把當初的 img 標籤換成帶有安全參數的 iframe 播放器
        html += `<div class="cyber-card p-5 md:p-6 rounded-3xl flex flex-row gap-6 items-center group ${i===0?'rank-1':''}">
            <div class="text-3xl font-black text-white/5 w-10 italic font-cyber">#${i+1}</div>
            <div class="relative w-32 md:w-56 aspect-video flex-shrink-0 overflow-hidden rounded-2xl bg-black border border-white/5">
                <iframe 
                    class="w-full h-full relative z-10" 
                    src="https://www.youtube.com/embed/${v.id}?origin=https://youtube-ranklist.vercel.app&enablejsapi=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="flex-grow min-w-0 flex flex-col justify-between py-1 lg:pl-6">
                <h2 class="text-white font-bold text-sm md:text-xl truncate group-hover:text-red-400 transition">${v.snippet.title}</h2>
                <p class="text-slate-500 text-xs italic tracking-widest leading-none mb-3">${v.snippet.channelTitle}</p>
                <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-3"><div class="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-1000" style="width: ${Math.min(power/1000, 100)}%"></div></div>
                <div class="flex justify-between items-end font-cyber">
                    <div class="text-left border-l-2 border-red-500/50 pl-4"><p class="text-[8px] text-orange-600 font-black tracking-widest">VOTES</p><p class="text-white text-base font-bold">${votes}</p></div>
                    <p class="pwr-val text-2xl md:text-3xl text-amber-400 font-black italic leading-none" data-val="${power}">0</p>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
    animateNumbers();
}

function animateNumbers() {
    document.querySelectorAll('.pwr-val').forEach(el => {
        const target = parseInt(el.getAttribute('data-val'));
        let count = 0;
        const update = () => {
            count += Math.ceil(target / 40);
            if (count < target) { el.innerText = count.toLocaleString(); requestAnimationFrame(update); }
            else { el.innerText = target.toLocaleString(); }
        };
        update();
    });
}

// [VS 模式核心]
function toggleVSMode(toVS) {
    isVSMode = toVS;
    document.getElementById('tab-trending').className = toVS ? "px-6 h-full flex items-center rounded-md font-black text-[10px] transition-all text-slate-400 border-b-2 border-transparent uppercase" : "px-6 h-full flex items-center rounded-md font-black text-[10px] transition-all tab-active uppercase";
    document.getElementById('tab-vs').className = toVS ? "px-6 h-full flex items-center rounded-md font-black text-[10px] transition-all tab-active uppercase" : "px-6 h-full flex items-center rounded-md font-black text-[10px] transition-all text-slate-400 border-b-2 border-transparent uppercase";
    document.getElementById('vs-section').classList.toggle('hidden', !toVS);
    document.getElementById('content-area').classList.toggle('hidden', toVS);
    if (isVSMode) setupMatch(); else renderTrending(cachedVideos);
}

function setupMatch() {
    if (cachedVideos.length < 2) return;
    let l = Math.floor(Math.random() * cachedVideos.length), r;
    do { r = Math.floor(Math.random() * cachedVideos.length); } while (l === r);
    renderVSCard('vs-left', cachedVideos[l]);
    renderVSCard('vs-right', cachedVideos[r]);
}

// 🛠️ 升級版：VS 對決小卡也改裝成可以看影片（且不影響原本點擊投票的功能）
function renderVSCard(id, video) {
    const el = document.getElementById(id);
    const votes = voteData[video.id] || 0;
    
    // 💡 這裡一樣把 img 改成播放器，並且把點擊投票的事件綁在字體區塊或外殼，這樣既能看影片又能投票！
    el.innerHTML = `<div class="cyber-card p-6 rounded-[3rem] text-center group transition-all duration-500">
        <div class="relative overflow-hidden rounded-[2rem] aspect-video mb-6 bg-black border border-white/5">
            <iframe 
                class="w-full h-full relative z-10" 
                src="https://www.youtube.com/embed/${video.id}?origin=https://youtube-ranklist.vercel.app&enablejsapi=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>
        </div>
        <div class="vote-trigger-zone cursor-pointer hover:text-red-500 transition duration-300">
            <p class="text-white font-black text-lg truncate mb-2 group-hover:text-red-400 transition">${video.snippet.title}</p>
            <p class="text-red-500 font-cyber text-2xl font-black italic">${votes} WINS</p>
            <p class="text-[9px] text-slate-500 font-cyber mt-1">// 點選此文字區塊進行投票</p>
        </div>
    </div>`;
    
    // 點選字體區進行 Firebase 投票與下一局切換
    const triggerZone = el.querySelector('.vote-trigger-zone');
    if (triggerZone) {
        triggerZone.onclick = (e) => {
            if (!window.fb) return;
            window.fb.runTransaction(window.fb.ref(window.fb.db, 'global_votes/' + video.id), (curr) => (curr || 0) + 1);
            el.style.transform = "scale(0.95)";
            setTimeout(() => { el.style.transform = "scale(1)"; setupMatch(); }, 150);
        };
    }
}

function initCloudSync() {
    if (!window.fb) return setTimeout(initCloudSync, 500);
    window.fb.onValue(window.fb.ref(window.fb.db, 'global_votes'), (snap) => {
        voteData = snap.val() || {};
        if (!isVSMode) renderTrending(cachedVideos);
    });
}

function handleSearch() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = cachedVideos.filter(v => v.snippet.title.toLowerCase().includes(term) || v.snippet.channelTitle.toLowerCase().includes(term));
    renderTrending(filtered);
}

function setupDevLabel() {
    const trigger = document.getElementById('dev-trigger');
    const info = document.getElementById('devInfo');
    if (trigger && info) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            info.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !info.contains(e.target)) {
                info.classList.add('hidden');
            }
        });
    }
}

window.onload = () => { initMarquee(); initCloudSync(); fetchTrending(); setupDevLabel(); };
